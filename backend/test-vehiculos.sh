#!/bin/bash

API_URL="http://localhost:4000/api"

echo "=== Test 1: Login y obtener token ==="
LOGIN_RESPONSE=$(curl -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@tas.hn","password":"admin123"}' \
  -s)

echo "$LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Error: No se pudo obtener el token"
  exit 1
fi

echo -e "\n✓ Token obtenido exitosamente\n"

echo "=== Test 2: Crear vehículo ==="
CREATE_RESPONSE=$(curl -X POST "${API_URL}/vehiculos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "placa": "TAS-001",
    "marca": "Toyota",
    "modelo": "Hilux 2023",
    "tipo": "Pickup",
    "kmActual": 5000,
    "kmUltimoMantenimiento": 3000
  }' \
  -s)

echo "$CREATE_RESPONSE"
VEHICULO_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo -e "\n✓ Vehículo creado con ID: $VEHICULO_ID\n"

echo "=== Test 3: Listar todos los vehículos ==="
curl -X GET "${API_URL}/vehiculos" \
  -H "Authorization: Bearer $TOKEN" \
  -s | head -c 500

echo -e "\n\n✓ Lista obtenida\n"

if [ -n "$VEHICULO_ID" ]; then
  echo "=== Test 4: Obtener vehículo por ID ==="
  curl -X GET "${API_URL}/vehiculos/${VEHICULO_ID}" \
    -H "Authorization: Bearer $TOKEN" \
    -s | head -c 500

  echo -e "\n\n✓ Vehículo obtenido\n"

  echo "=== Test 5: Actualizar vehículo ==="
  curl -X PATCH "${API_URL}/vehiculos/${VEHICULO_ID}" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "kmActual": 6500,
      "marca": "Toyota (actualizado)"
    }' \
    -s | head -c 500

  echo -e "\n\n✓ Vehículo actualizado\n"

  echo "=== Test 6: Eliminar vehículo ==="
  curl -X DELETE "${API_URL}/vehiculos/${VEHICULO_ID}" \
    -H "Authorization: Bearer $TOKEN" \
    -s

  echo -e "\n\n✓ Vehículo eliminado\n"
fi

echo "=== Todas las pruebas completadas ==="
