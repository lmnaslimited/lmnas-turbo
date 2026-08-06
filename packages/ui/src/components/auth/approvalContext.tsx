"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import posthog from "posthog-js";
import { fnCheckUserApproval } from "@repo/ui/api/crm/check-user-approval";

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

export function ApprovalProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<TApprovalStatus>("verifying");
    const [isCustomer, setIsCustomer] = useState(false);
    const isFetchingRef = useRef(false);

    const fnFetchApproval = async (iTargetIdentifier?: string, forceRefresh = false) => {
        // Resolve distinct ID dynamically at execution time
        const LIdentifier = iTargetIdentifier

        if (!LIdentifier) {
            setStatus("unapproved");
            return;
        }

        // 1. Check Session Cache (if not forcing refresh)
        if (!forceRefresh) {
            const cached = sessionStorage.getItem(STORAGE_KEY);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    // Match against the queried identifier, not just email
                    if (parsed.identifier === LIdentifier) {
                        setStatus(parsed.status);
                        setIsCustomer(parsed.isCustomer);
                        return parsed
                    }
                } catch {
                    sessionStorage.removeItem(STORAGE_KEY);
                }
            }
        }

        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setStatus("verifying");

        try {
            const result = await fnCheckUserApproval(LIdentifier);
            
            let resolvedStatus: TApprovalStatus = "unapproved";
            const userEmail = result?.email || LIdentifier;
            const customerFlag = !!result?.is_customer;

            if (result?.approved) {
                resolvedStatus = "approved";
            } else if (result?.reason === "NOT_QUALIFIED") {
                resolvedStatus = "review_pending";
            } else {
                resolvedStatus = "unapproved";
            }

            // Update state
            setStatus(resolvedStatus);
            setIsCustomer(customerFlag);

            // 2. Write to Session Storage using the identifier as key
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    identifier: LIdentifier,
                    status: resolvedStatus,
                    email: userEmail,
                    isCustomer: customerFlag,
                })
            );

            return {identifier: LIdentifier,
                    status: resolvedStatus,
                    email: userEmail,
                    isCustomer: customerFlag,}
        } catch (error) {
            console.error("Approval check failed:", error);
            setStatus("unapproved");
        } finally {
            isFetchingRef.current = false;
        }
    };

    // Handle initial mount check when PostHog initializes
    useEffect(() => {
        const LDistinctId = posthog.get_distinct_id();
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
                status,
                isCustomer,
                refetch: async (iTargetIdentifier?: string) => {
                    isFetchingRef.current = false;
                    sessionStorage.removeItem(STORAGE_KEY);
                    return await fnFetchApproval(iTargetIdentifier, true);
                },
            }}
        >
            {children}
        </ApprovalContext.Provider>
    );
}

export function useApproval() {
    return useContext(ApprovalContext);
}