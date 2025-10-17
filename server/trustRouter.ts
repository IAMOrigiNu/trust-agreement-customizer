import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { notifyOwner } from "./_core/notification";

export const trustRouter = router({
  submitAgreement: publicProcedure
    .input(
      z.object({
        selectedUser: z.string(),
        selectedComponents: z.array(z.string()),
        selectedServices: z.record(z.string(), z.array(z.string())),
        customServices: z.record(z.string(), z.string()),
        contactInfo: z.object({
          name: z.string(),
          email: z.string(),
          phone: z.string(),
          address: z.string(),
          partnerName: z.string(),
          partnerEmail: z.string(),
          partnerPhone: z.string(),
          partnerAddress: z.string(),
        }),
        signatures: z.object({
          eli: z.string(),
          carmen: z.string(),
          date: z.string(),
        }),
        agreementText: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Generate CSV content
      const csvRows: string[][] = [
        ["Field", "Value"],
        ["Completed By", input.selectedUser],
        ["Name", input.contactInfo.name],
        ["Email", input.contactInfo.email],
        ["Phone", input.contactInfo.phone],
        ["Address", input.contactInfo.address],
        ["Partner Name", input.contactInfo.partnerName],
        ["Partner Email", input.contactInfo.partnerEmail],
        ["Partner Phone", input.contactInfo.partnerPhone],
        ["Partner Address", input.contactInfo.partnerAddress],
        ["Signature Date", input.signatures.date],
        [""],
        ["Selected Components"],
        ...input.selectedComponents.map(comp => ["", comp]),
        [""],
        ["Selected Services by Component"],
      ];

      // Add services for each component
      for (const [component, services] of Object.entries(input.selectedServices)) {
        csvRows.push([component, ""]);
        (services as string[]).forEach((service: string) => {
          csvRows.push(["", service]);
        });
      }

      // Add custom services
      csvRows.push([""], ["Custom Services by Component"]);
      for (const [component, customText] of Object.entries(input.customServices)) {
        if (customText) {
          csvRows.push([component, customText]);
        }
      }

      const csvContent = csvRows.map(row => 
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(",")
      ).join("\n");

      // Send notification to owner with both CSV data and PDF agreement
      const emailContent = `
New Trust Agreement Submission

Completed by: ${input.selectedUser}
Name: ${input.contactInfo.name}
Email: ${input.contactInfo.email}
Date: ${input.signatures.date}

---

CSV DATA:
${csvContent}

---

FULL AGREEMENT:
${input.agreementText}
      `;

      await notifyOwner({
        title: `Trust Agreement Submission - ${input.contactInfo.name}`,
        content: emailContent,
      });

      return { success: true };
    }),
});
