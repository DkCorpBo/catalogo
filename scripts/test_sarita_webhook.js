// test_sarita_webhook.js
// Script para simular una petición desde el CRM Sarita IA pidiendo código de acceso

const url = "http://localhost:3000/api/v1/whatsapp/request-otp";
const token = "sk_sarita_live_tiendas_2026";

async function testSaritaIntegration() {
  console.log("🚀 Probando integración de Sarita IA con la Plataforma...");
  
  // 1. Probar con un número de tienda existente (70000000 - Mi Tienda Demo)
  console.log("\n1️⃣ Petición para número existente (70000000):");
  const res1 = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ telefono: "+59170000000" })
  });

  console.log("Status:", res1.status);
  const data1 = await res1.json();
  console.log("Respuesta de la API para Sarita IA:\n", JSON.stringify(data1, null, 2));

  // 2. Probar con un número que NO existe
  console.log("\n2️⃣ Petición para número NO registrado (79999999):");
  const res2 = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ telefono: "+59179999999" })
  });

  console.log("Status:", res2.status);
  const data2 = await res2.json();
  console.log("Respuesta de la API para Sarita IA:\n", JSON.stringify(data2, null, 2));
}

testSaritaIntegration();
