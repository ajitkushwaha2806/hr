"use client";

import { Document, Page, Text, View, Image, Font } from "@react-pdf/renderer";
import { styles } from "./styles";
import { NDA_SECTIONS, NDA_WHEREAS } from "./ndaTemplate";

Font.register({
  family: "Poppins",
  fonts: [
    { src: "/fonts/Poppins-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Poppins-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/Poppins-SemiBold.ttf", fontWeight: 600 },
    { src: "/fonts/Poppins-Bold.ttf", fontWeight: 700 },
  ],
});

function CommonHeader({ date, company, client }) {
  return (
    <View style={styles.headerContainer} fixed>
      <View style={styles.stripTop} />
      <View style={styles.headerRow}>
        <Image src={company.logo || "/assets/icons/logo.png"} style={styles.logo} alt="Company Logo" />
        <View style={styles.companyInfo}>
          <Text style={{ fontWeight: 700, color: "#0f172a" }}>{company.name}</Text>
          <Text>{company.phone}</Text>
          <Text>{company.website}</Text>
        </View>
      </View>
      <View style={styles.headerBottomRow}>
        <View>
          <Text style={styles.blackBold}>
            To: <Text style={styles.blueBold}>{client?.name?.toUpperCase()}</Text>
          </Text>
          <Text style={{ fontSize: 7.5, color: "#64748b" }}>
            Designation: {client?.designation} • Dept: {client?.department}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.blackBold}>Date: {date}</Text>
          <Text style={{ fontSize: 7.5, color: "#64748b" }}>Ref: NDA-EXEC-{new Date().getFullYear()}</Text>
        </View>
      </View>
    </View>
  );
}

function CommonFooter({ pageNumber = 1, totalPages = 2 }) {
  return (
    <View style={styles.footer} fixed>
      <View style={styles.footerText}>
        <Text>Employee Non-Disclosure & Proprietary Rights Agreement • Confidential</Text>
        <Text>Page {pageNumber} of {totalPages}</Text>
      </View>
      <View style={styles.footerWave} />
    </View>
  );
}

function Page2Header({ company, date }) {
  return (
    <View style={styles.headerPage2} fixed>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={[styles.blackBold, { fontSize: 8.5 }]}>{company.name}</Text>
        <Text style={{ fontSize: 8, color: "#64748b" }}>• NDA Terms & Execution Covenants</Text>
      </View>
      <Text style={[styles.blackBold, { fontSize: 8 }]}>{date}</Text>
    </View>
  );
}

export default function MagicScaleNdaPDF({ company, client, agreement, signatureData }) {
  if (!company || !client || !agreement) return null;

  // 11 Sections cleanly split: 1-5 on Page 1, 6-11 on Page 2
  const page1Sections = NDA_SECTIONS.slice(0, 5);
  const page2Sections = NDA_SECTIONS.slice(5);

  return (
    <Document title={`NDA_${client.name}`} author={company.name} creator="Magic Scale trueHR">
      {/* ============================================================== */}
      {/* PAGE 1: Preamble, Whereas, Scope & Sections 1 - 5              */}
      {/* ============================================================== */}
      <Page size="A4" style={styles.page}>
        <CommonHeader date={agreement.date} company={company} client={client} />

        <View style={styles.content}>
          <Text style={[styles.paragraph, { fontWeight: 700, color: "#0f172a", textAlign: "center", marginBottom: 6 }]}>
            NON-DISCLOSURE AND PROPRIETARY RIGHTS AGREEMENT (NDA)
          </Text>

          <Text style={styles.paragraph}>
            This Non-Disclosure and Proprietary Rights Agreement is entered into on this <Text style={styles.blueBold}>{agreement.date}</Text> by and between:
          </Text>

          <Text style={styles.paragraph}>
            <Text style={styles.blueBold}>{company.name}</Text>, having its registered corporate office at <Text style={styles.blackBold}>{company.address}</Text> (hereinafter referred to as the <Text style={styles.blackBold}>“Company”</Text>), represented by <Text style={styles.blackBold}>{company.representative}</Text> as <Text style={styles.blackBold}>{company.designation}</Text>;
          </Text>

          <Text style={[styles.paragraph, { textAlign: "center", fontWeight: "bold", marginVertical: 1 }]}>AND</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.blueBold}>{client.name?.toUpperCase()}</Text>, residing at <Text style={styles.blackBold}>{client.address}</Text>, Phone: <Text style={styles.blackBold}>{client.phone}</Text>, Email: <Text style={styles.blackBold}>{client.email}</Text>, engaged as <Text style={styles.blackBold}>{client.designation}</Text> in <Text style={styles.blueBold}>{client.department}</Text> (hereinafter referred to as the <Text style={styles.blackBold}>“Receiving Party”</Text>).
          </Text>

          <Text style={styles.sectionHeading}>WHEREAS:</Text>
          <View style={styles.bulletList}>
            {NDA_WHEREAS.map((item, i) => (
              <View style={styles.bulletItem} key={i} wrap={false}>
                <Text style={styles.bulletDot}>•</Text>
                <Text>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.paragraph, { fontStyle: "italic", marginTop: 2, marginBottom: 4 }]}>
            NOW, THEREFORE, in consideration of employment/engagement, confidential disclosures, and mutual covenants herein, the parties agree as follows:
          </Text>

          {/* Sections 1 to 5 */}
          {page1Sections.map((sec, idx) => (
            <View key={idx} wrap={false}>
              <Text style={styles.sectionHeading}>{sec.number}</Text>
              {sec.intro && <Text style={styles.paragraph}>{sec.intro}</Text>}
              {sec.bullets && (
                <View style={styles.bulletList}>
                  {sec.bullets.map((b, bIdx) => (
                    <View style={styles.bulletItem} key={bIdx} wrap={false}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text>{b}</Text>
                    </View>
                  ))}
                </View>
              )}
              {sec.paragraphs &&
                sec.paragraphs.map((p, pIdx) => (
                  <Text key={pIdx} style={styles.paragraph}>
                    {p}
                  </Text>
                ))}
              {sec.note && (
                <Text style={[styles.paragraph, { marginTop: 2 }]}>
                  <Text style={styles.blackBold}>Note: </Text>
                  <Text style={styles.blueBold}>{sec.note}</Text>
                </Text>
              )}
            </View>
          ))}
        </View>

        <CommonFooter pageNumber={1} totalPages={2} />
      </Page>

      {/* ============================================================== */}
      {/* PAGE 2: IP, Assets, Breach, Statutory Law & Signatures         */}
      {/* ============================================================== */}
      <Page size="A4" style={styles.page2}>
        <View style={styles.stripTop} />
        <Page2Header company={company} date={agreement.date} />

        <View style={styles.content}>
          {/* Sections 6 to 11 */}
          {page2Sections.map((sec, idx) => (
            <View key={idx} wrap={false}>
              <Text style={styles.sectionHeading}>{sec.number}</Text>
              {sec.intro && <Text style={styles.paragraph}>{sec.intro}</Text>}
              {sec.bullets && (
                <View style={styles.bulletList}>
                  {sec.bullets.map((b, bIdx) => (
                    <View style={styles.bulletItem} key={bIdx} wrap={false}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text>{b}</Text>
                    </View>
                  ))}
                </View>
              )}
              {sec.paragraphs &&
                sec.paragraphs.map((p, pIdx) => (
                  <Text key={pIdx} style={styles.paragraph}>
                    {p}
                  </Text>
                ))}
              {sec.note && (
                <Text style={[styles.paragraph, { marginTop: 2 }]}>
                  <Text style={styles.blackBold}>Note: </Text>
                  <Text style={styles.blueBold}>{sec.note}</Text>
                </Text>
              )}
            </View>
          ))}

          {/* Two-Column Execution & Signature Block */}
          <View style={styles.signatureRow} wrap={false}>
            <View style={styles.signatureBlockCompany}>
              <Text style={styles.blackBold}>FOR & ON BEHALF OF THE COMPANY:</Text>
              <Text style={[styles.blueBold, { marginTop: 3 }]}>{company.name}</Text>
              <Text style={[styles.paragraph, { fontSize: 8, marginTop: 2, marginBottom: 2 }]}>
                Authorized Signatory: <Text style={styles.blackBold}>{company.representative}</Text>
              </Text>
              <Text style={[styles.paragraph, { fontSize: 8, marginBottom: 2 }]}>
                Designation: <Text style={styles.blackBold}>{company.designation}</Text>
              </Text>
              <Text style={[styles.paragraph, { fontSize: 7.5, color: "#64748b" }]}>
                Execution Date: {agreement.date}
              </Text>
              <Text style={[styles.paragraph, { fontSize: 7, color: "#0f172a", marginTop: 4, fontStyle: "italic" }]}>
                [ Authorized Corporate Signatory & Official Seal ]
              </Text>
            </View>

            <View style={styles.signatureBlockClient}>
              <Text style={styles.blackBold}>RECEIVING PARTY (EMPLOYEE / CONSULTANT):</Text>
              <Text style={[styles.blueBold, { marginTop: 3 }]}>{client.name?.toUpperCase()}</Text>
              <Text style={[styles.paragraph, { fontSize: 8, marginTop: 2, marginBottom: 2 }]}>
                Designation: <Text style={styles.blackBold}>{client.designation}</Text>
              </Text>
              {signatureData ? (
                signatureData.startsWith("data:image") || signatureData.startsWith("http") ? (
                  <Image src={signatureData} style={styles.signatureImage} />
                ) : (
                  <Text style={[styles.blueBold, { marginTop: 8, fontSize: 11, fontStyle: "italic" }]}>
                    {signatureData}
                  </Text>
                )
              ) : (
                <Text style={[styles.paragraph, { fontSize: 7.5, color: "#f59e0b", marginTop: 8 }]}>
                  [ Pending Electronic Signature ]
                </Text>
              )}
              <Text style={[styles.paragraph, { fontSize: 7.5, color: "#64748b", marginTop: 2 }]}>
                Digitally Stamped: {agreement.date}
              </Text>
            </View>
          </View>

        </View>

        <CommonFooter pageNumber={2} totalPages={2} />
      </Page>
    </Document>
  );
}
