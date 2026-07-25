import { NextResponse } from "next/server";
import { z } from "zod";
import InquiryEmail from "@/emails/inquiry-email";
import { catalog } from "@/data/catalog.generated";
import { getResend } from "@/lib/resend";

const inquirySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  company: z.string().trim().min(1).max(150),
  phone: z.string().trim().max(60).optional().default(""),
  seriesSlug: z.string().trim().max(100).optional().default(""),
  typeSlug: z.string().trim().max(100).optional().default(""),
  imageIds: z.array(z.string().trim().max(200)).max(50).optional().default([]),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(200).optional().default(""),
  locale: z.enum(["en", "zh"]).optional().default("en"),
});

export async function POST(request: Request) {
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const parsed = inquirySchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Please check the submitted fields" }, { status: 422 });
  if (parsed.data.website) return NextResponse.json({ ok: true });
  if (!process.env.RESEND_API_KEY || !process.env.INQUIRY_FROM_EMAIL || !process.env.INQUIRY_TO_EMAIL) {
    return NextResponse.json({ error: "Inquiry service is not configured" }, { status: 503 });
  }

  const series = catalog.find((item) => item.slug === parsed.data.seriesSlug);
  const productType = series?.types.find((type) => type.slug === parsed.data.typeSlug);
  const imageReferences = productType?.images.filter((image) => parsed.data.imageIds.includes(image.id)).map((image) => image.id) || [];
  const locale = parsed.data.locale;

  try {
    const { error } = await getResend().emails.send({
      from: process.env.INQUIRY_FROM_EMAIL,
      to: [process.env.INQUIRY_TO_EMAIL],
      replyTo: parsed.data.email,
      subject: `New inquiry — ${parsed.data.company}`,
      react: InquiryEmail({ ...parsed.data, imageReferences, series: series?.name[locale], productType: productType?.name[locale] }),
    });
    if (error) throw new Error("Resend rejected the message");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to send inquiry" }, { status: 502 });
  }
}
