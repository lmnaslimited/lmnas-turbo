import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { TformFieldConfig } from "@repo/middleware";

/**
 * Generates a Zod validation schema object dynamically based on an array of field definitions.
 * 
 * @param fields - An array of field objects, each containing metadata like name, required flag, validation message, and default value.
 * @returns A Zod object schema tailored to validate the given fields according to their rules.
 */
export function generateSchemaFromFields(iaFields: TformFieldConfig[]): z.ZodObject<any> {
  // Initialize an empty shape object to hold individual field validators
    const LdShape: Record<string, z.ZodTypeAny> = {};
  
    for (const LdField of iaFields) {
      const { name, required, validationMessage, defaultValue } = LdField;
      const requiredError = validationMessage || `Please fill out ${name}`;
  
      switch (name) {
        case "date":
          LdShape[name] = required
            ? z.coerce.date({ required_error: requiredError })  // coerce string to date, required
            : z.coerce.date().optional();
          break;
  
        case "timezone":
        case "timeSlot":
          LdShape[name] = required
            ? z.string().min(1, requiredError )
            : z.string().optional();
          break;
  
        case "name":
          LdShape[name] = required
            ? z
                .string()
                .regex(/^[A-Za-z\s]+$/, requiredError || "Name can only contain letters and spaces")
            : z
                .string()
                .regex(/^[A-Za-z\s]+$/, requiredError || "Name can only contain letters and spaces")
                .optional();
          break;
  
        case "phone":
          LdShape[name] = required
            ? z.string().refine((val) => isValidPhoneNumber(val), {
                message: requiredError ||"Invalid phone number",
              })
            : z
                .string()
                .refine((val) => isValidPhoneNumber(val), {
                  message: requiredError || "Invalid phone number",
                })
                .optional();
          break;
  
        case "email":
          LdShape[name] = required
            ? z.string().email(requiredError || "Please enter a valid email")
            : z.string().email(requiredError || "Please enter a valid email").optional();
          break;
  
        case "message":
          // You treat message as always optional, so keep as is
          LdShape[name] = required
          ? z.string().min(1, requiredError || "please leave your message" )
          : z.string().optional();
          break;
  
        case "newsletter":
          // default true always, ignoring required flag here
          LdShape[name] = z.boolean().default(true);
          break;
  
        case "enquiryType":
          // has default value, ignoring required flag here
          LdShape[name] = z.string().default(defaultValue ?? "");
          break;
  
        default:
          LdShape[name] = required
            ? z.string({ required_error: requiredError })
            : z.string().optional();
      }
    }

    return z.object(LdShape);
  }