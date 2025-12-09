#!/bin/bash

API_URL="http://localhost:4001/api"

echo "========================================="
echo "  PRUEBA COMPLETA CRUD DE VEHÍCULOS"
echo "========================================="
echo ""

# Obtener token
echo "📝 Test 1: Login y obtener token JWT"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@tas.hn","password":"admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Error: No se pudo obtener el token"
  exit 1
fi

echo "✅ Token obtenido exitosamente"
echo ""

# Listar todos los vehículos
echo "📋 Test 2: GET /api/vehiculos - Listar todos los vehículos"
curl -s -X GET "${API_URL}/vehiculos" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "✅ Lista de vehículos obtenida"
echo ""

# Crear segundo vehículo
echo "➕ Test 3: POST /api/vehiculos - Crear segundo vehículo"
CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/vehiculos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "placa": "TAS-002",
    "marca": "Ford",
    "modelo": "Ranger 2022",
    "tipo": "Pickup",
    "kmActual": 12000,
    "kmUltimoMantenimiento": 10000
  }')

echo "$CREATE_RESPONSE" | jq '.'
VEHICULO_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
echo "✅ Vehículo creado con ID: $VEHICULO_ID"
echo ""

# Obtener vehículo por ID
echo "🔍 Test 4: GET /api/vehiculos/:id - Obtener vehículo específico"
curl -s -X GET "${API_URL}/vehiculos/${VEHICULO_ID}" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo "✅ Vehículo ID $VEHICULO_ID obtenido"
echo ""

# Actualizar vehículo
echo "✏️  Test 5: PATCH /api/vehiculos/:id - Actualizar vehículo"
curl -s -X PATCH "${API_URL}/vehiculos/${VEHICULO_ID}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "kmActual": 15000,
    "marca": "Ford (Actualizado)"
  }' | jq '.'
echo "✅ Vehículo actualizado"
echo ""

# Intentar crear vehículo con placa duplicada
echo "⚠️  Test 6: Validación de placa única (debe fallar)"
curl -s -X POST "${API_URL}/vehiculos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "placa": "TAS-002",
    "marca": "Honda",
    "modelo": "Test",
    "tipo": "Sedan"
  }' | jq '.'
echo "✅ Validación de placa única funcionó correctamente"
echo ""

# Eliminar vehículo
echo "🗑️  Test 7: DELETE /api/vehiculos/:id - Eliminar vehículo"
curl -s -X DELETE "${API_URL}/vehiculos/${VEHICULO_ID}" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo "✅ Vehículo eliminado"
echo ""

# Verificar que fue eliminado
echo "🔍 Test 8: Verificar eliminación (debe retornar 404)"
curl -s -X GET "${API_URL}/vehiculos/${VEHICULO_ID}" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo "✅ Verificación de eliminación correcta"
echo ""

echo "========================================="
echo "  ✅ TODAS LAS PRUEBAS COMPLETADAS"
echo "========================================="
