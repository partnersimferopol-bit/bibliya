#!/bin/bash
# Установка PocketBase на Ubuntu (Timeweb Cloud / Selectel)
# Запуск на сервере: bash install-pocketbase.sh

set -e

PB_VERSION="0.25.9"
PB_DIR="/opt/pocketbase"
DOMAIN="${1:-}"

echo "==> Установка PocketBase ${PB_VERSION}"

apt-get update -qq
apt-get install -y -qq unzip wget

mkdir -p "$PB_DIR"
cd "$PB_DIR"

if [ ! -f pocketbase ]; then
  wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip" -O pb.zip
  unzip -o pb.zip
  rm pb.zip
  chmod +x pocketbase
fi

# systemd-сервис
cat > /etc/systemd/system/pocketbase.service << EOF
[Unit]
Description=PocketBase for Bibliya Battle
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${PB_DIR}
ExecStart=${PB_DIR}/pocketbase serve --http=0.0.0.0:8090
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable pocketbase
systemctl restart pocketbase

echo ""
echo "✅ PocketBase запущен на порту 8090"
echo ""
echo "1. Откройте в браузере: http://ВАШ_IP:8090/_/"
echo "2. Создайте админ-аккаунт"
echo "3. Создайте коллекцию game_rooms (см. scripts/pocketbase/schema-game_rooms.json)"
echo "4. В Settings → API rules для game_rooms:"
echo "   List/View/Create/Update: пустое правило (разрешить всем) — для теста"
echo "5. В игре укажите NEXT_PUBLIC_POCKETBASE_URL=http://ВАШ_IP:8090"
echo ""
if [ -n "$DOMAIN" ]; then
  echo "Для домена ${DOMAIN} настройте nginx + HTTPS (certbot)"
fi
