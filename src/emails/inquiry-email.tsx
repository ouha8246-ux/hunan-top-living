import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

export type InquiryEmailProps = {
  name: string;
  email: string;
  company: string;
  phone?: string;
  series?: string;
  productType?: string;
  imageReferences?: string[];
  message: string;
};

export default function InquiryEmail(props: InquiryEmailProps) {
  return (
    <Html><Head /><Preview>New inquiry from {props.company}</Preview>
      <Body style={{ background: "#f4f3ef", fontFamily: "Arial, sans-serif", margin: 0, padding: "32px 12px" }}>
        <Container style={{ background: "#fff", borderRadius: 18, maxWidth: 600, padding: 36 }}>
          <Text style={{ color: "#777", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase" }}>HunanTopLiving inquiry</Text>
          <Heading style={{ color: "#171715", fontSize: 30, fontWeight: 500, margin: "12px 0 28px" }}>A new project begins here.</Heading>
          <Section>
            <Text><strong>Name</strong><br />{props.name}</Text><Text><strong>Email</strong><br />{props.email}</Text>
            <Text><strong>Company</strong><br />{props.company}</Text>{props.phone && <Text><strong>Phone</strong><br />{props.phone}</Text>}
            {props.series && <Text><strong>Collection</strong><br />{props.series}</Text>}
            {props.productType && <Text><strong>Product type</strong><br />{props.productType}</Text>}
            {props.imageReferences?.length ? <Text><strong>Selected products</strong><br />{props.imageReferences.join(", ")}</Text> : null}
          </Section><Hr style={{ borderColor: "#e8e6df", margin: "28px 0" }} />
          <Text style={{ lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{props.message}</Text>
        </Container>
      </Body>
    </Html>
  );
}
