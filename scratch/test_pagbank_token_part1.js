
const fullToken = "e82e3dba-0dd7-4ba1-8afd-0feec510ca1c038248324d9a86eb68c57216168cba2f27ab-c6a0-499f-8e4b-fac05bad286b";
const token = fullToken.substring(0, 32); // e82e3dba0dd74ba18afd0feec510ca1c sem hífens
// Pera, com hífens são 36 caracteres. Sem hífens são 32.
const tokenClean = "e82e3dba0dd74ba18afd0feec510ca1c"; 

const email = "ronaldo.grupogold@icloud.com";

async function test() {
  const url = `https://ws.sandbox.pagseguro.uol.com.br/v2/checkout?email=${email}&token=${tokenClean}`;
  const xml = `
    <checkout>
      <items>
        <item>
          <id>0001</id>
          <description>Plano Mensal - Teste</description>
          <amount>99.90</amount>
          <quantity>1</quantity>
        </item>
      </items>
      <currency>BRL</currency>
      <receiver>
        <email>${email}</email>
      </receiver>
      <redirectURL>http://localhost:3000</redirectURL>
    </checkout>
  `;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/xml; charset=ISO-8859-1" },
      body: xml
    });
    const text = await res.text();
    console.log("Token:", tokenClean);
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
