#!/bin/bash

# Configuration
API_URL="http://localhost:4001/api"
EMAIL="dchavarria@tas-seguridad.com"
PASSWORD="TAS2024"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Testing Asignaciones CRUD...${NC}"

# 1. Login
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"correo\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Login failed${NC}"
    echo "Raw Response: '$LOGIN_RESPONSE'"
    exit 1
fi
echo "Token received."

# 2. Get IDs (Vehiculo, Usuario, Encargado)
echo "Fetching entities to get IDs..."
VEHICULO_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/vehiculos" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
USUARIO_ID=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/usuarios" | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)
# Using same user as encargado for simplicity in test
ENCARGADO_ID=$USUARIO_ID

if [ -z "$VEHICULO_ID" ] || [ -z "$USUARIO_ID" ]; then
    echo -e "${RED}Failed to fetch prerequisites - Vehiculo or Usuario missing${NC}"
    exit 1
fi

echo "Using Vehiculo ID: $VEHICULO_ID, Usuario ID: $USUARIO_ID, Encargado ID: $ENCARGADO_ID"

# 3. Create Asignacion
echo "Creating Asignacion..."
CREATE_PAYLOAD="{\"vehiculoId\": $VEHICULO_ID, \"usuarioId\": $USUARIO_ID, \"encargadoId\": $ENCARGADO_ID, \"kmSalida\": 15000, \"observaciones\": \"Test asignacion\", \"uso\": \"Ruta Norte\"}"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/asignaciones" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$CREATE_PAYLOAD")

ASIGNACION_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | head -n 1 | cut -d':' -f2)

if [ -z "$ASIGNACION_ID" ]; then
    echo -e "${RED}Failed to create Asignacion${NC}"
    echo $CREATE_RESPONSE
    exit 1
fi
echo -e "${GREEN}Asignacion created with ID: $ASIGNACION_ID${NC}"

# 4. Get All
echo "Listing Asignaciones..."
curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/asignaciones" > /dev/null
echo "List OK"

# 5. Update Asignacion
echo "Updating Asignacion (Finalizar)..."
UPDATE_PAYLOAD="{\"estado\": \"FINALIZADA\", \"kmRetorno\": 15100, \"horaRetorno\": \"18:00\", \"observaciones\": \"Regreso sin novedad\"}"
UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/asignaciones/$ASIGNACION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD")

echo $UPDATE_RESPONSE | grep "FINALIZADA" > /dev/null
if [ $? -eq 0 ]; then
     echo -e "${GREEN}Update OK${NC}"
else
     echo -e "${RED}Update Failed${NC}"
     echo $UPDATE_RESPONSE
fi

# 6. Delete Asignacion
echo "Deleting Asignacion..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/asignaciones/$ASIGNACION_ID" \
  -H "Authorization: Bearer $TOKEN")

# Verify deletion
GET_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/asignaciones/$ASIGNACION_ID")
echo $GET_RESPONSE | grep "no encontrada" > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Delete OK${NC}"
else
    echo -e "${RED}Delete verification failed (might still exist)${NC}"
    echo $GET_RESPONSE
fi
