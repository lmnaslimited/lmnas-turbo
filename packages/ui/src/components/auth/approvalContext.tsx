"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import posthog from "posthog-js";
import { TLoginSource } from "@repo/middleware/types";
import { useParams } from "next/navigation";

export type TApprovalStatus = "verifying" | "approved" | "review_pending" | "unapproved";

export interface IApprovalResult {
    identifier?: string;
    status: TApprovalStatus;
    email?: string;
    isCustomer: boolean;
}

interface IApprovalContext {
    status: TApprovalStatus;
    isCustomer: boolean;
    refetch: (iTargetIdentifier?: string) => Promise<IApprovalResult | undefined>;
}

const STORAGE_KEY = "user_approval_cache";

const ApprovalContext = createContext<IApprovalContext>({
    status: "verifying",
    isCustomer: false,
    refetch: async () => undefined,
});

export function ApprovalProvider({ children,loginSettings, iStatus
}: { children: React.ReactNode , loginSettings: TLoginSource, iStatus:string}) {
    // Retrieves route parameters and query parameters
    const LdParams = useParams();
    // Extract the locale value from the route parameters.
    const LLocale = LdParams.locale as string;
    // Stores the current approval status.
    const [LStatus, fnSetStatus] = useState<TApprovalStatus>("verifying");
    // Indicates whether the identified user is an existing customer.
    const [LIsCustomer, fnSetIsCustomer] = useState(false);
    // Prevents multiple approval requests from running simultaneously.
    const LiIsFetchingRef = useRef(false);

    // Fetches the user's approval status from CRM.
    const fnFetchApproval = async (iTargetIdentifier?: string, forceRefresh = false) => {
        // Resolve the identifier that should be validated.
        const LIdentifier = iTargetIdentifier

        if (!LIdentifier) {
            fnSetStatus("unapproved");
            return;
        }

        // Read from session storage unless a fresh lookup is requested.
        if (!forceRefresh) {
            const LdCachedSession = sessionStorage.getItem(STORAGE_KEY);
            if (LdCachedSession) {
                try {
                    const LdParsed = JSON.parse(LdCachedSession);
                    // Match against the queried identifier, not just email
                    if (LdParsed.identifier === LIdentifier) {
                        fnSetStatus(LdParsed.status);
                        fnSetIsCustomer(LdParsed.isCustomer);
                        return LdParsed
                    }
                } catch {
                    sessionStorage.removeItem(STORAGE_KEY);
                }
            }
        }

        // Prevent duplicate API requests.
        if (LiIsFetchingRef.current) return;
        LiIsFetchingRef.current = true;
        fnSetStatus("verifying");

        try {
            // Fetch the approval status from CRM.
            const LdVerifyApproval = await fetch("/api/approval-access", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  distinctId: LIdentifier,
                  doctypeConfig: loginSettings.loginAndSignUp.doctypeDetails,
                  locale: LLocale,
                  LStatus: iStatus
                }),
              });
            const LdResult = await LdVerifyApproval.json();
            let lResolvedStatus: TApprovalStatus = "unapproved";
            // Use the CRM email when available.
            const LUserEmail = LdResult?.email || LIdentifier;
            const LCustomerFlag = !!LdResult?.is_customer;

            if (LdResult?.approved) {
                lResolvedStatus = "approved";
            } else if (LdResult?.reason === "NOT_QUALIFIED") {
                lResolvedStatus = "review_pending";
            } else {
                lResolvedStatus = "unapproved";
            }

            // Update state
            fnSetStatus(lResolvedStatus);
            fnSetIsCustomer(LCustomerFlag);

            // Cache the latest approval result for future lookups.
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    identifier: LIdentifier,
                    status: lResolvedStatus,
                    email: LUserEmail,
                    isCustomer: LCustomerFlag,
                })
            );

            return {identifier: LIdentifier,
                    status: lResolvedStatus,
                    email: LUserEmail,
                    isCustomer: LCustomerFlag,}
        } catch (error) {
            console.error("Approval check failed:", error);
            fnSetStatus("unapproved");
        } finally {
            LiIsFetchingRef.current = false;
        }
    };

    // Check approval when the provider is mounted.
    useEffect(() => {
        // Get the currently identified PostHog user.
        const LDistinctId = posthog.get_distinct_id();
        // Proceed only when the distinct ID is an email.
        if (LDistinctId?.includes("@")) {
            fnFetchApproval(LDistinctId);
        } else {
            // Fallback for PostHog async initialization
            if (posthog.__loaded) {
                fnFetchApproval();
            } else {
                const timer = setTimeout(() => fnFetchApproval(), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    return (
        <ApprovalContext.Provider
            value={{
                status: LStatus,
                isCustomer: LIsCustomer,
                // Forces a fresh approval lookup by clearing the cache.
                refetch: async (iTargetIdentifier?: string) => {
                    LiIsFetchingRef.current = false;
                    sessionStorage.removeItem(STORAGE_KEY);
                    return await fnFetchApproval(iTargetIdentifier, true);
                },
            }}
        >
            {children}
        </ApprovalContext.Provider>
    );
}

// Hook used by components to access the approval context.
export function useApproval() {
    return useContext(ApprovalContext);
}