import json

# Precise coordinates for Turkish districts
coordinates = {
    # Istanbul
    ("İstanbul", "Kadıköy"): ("40.9873", "29.0251"),
    ("İstanbul", "Beşiktaş"): ("41.0422", "29.0074"),
    ("İstanbul", "Sarıyer"): ("41.1686", "29.0544"),
    ("İstanbul", "Şişli"): ("41.0602", "28.9875"),
    ("İstanbul", "Üsküdar"): ("41.0224", "29.0149"),
    ("İstanbul", "Bakırköy"): ("40.9833", "28.8597"),
    ("İstanbul", "Maltepe"): ("40.9336", "29.1272"),
    ("İstanbul", "Ataşehir"): ("40.9827", "29.1237"),
    ("İstanbul", "Pendik"): ("40.8783", "29.2333"),
    # Ankara
    ("Ankara", "Çankaya"): ("39.9180", "32.8628"),
    ("Ankara", "Keçiören"): ("39.9808", "32.8625"),
    ("Ankara", "Etimesgut"): ("39.9478", "32.6750"),
    ("Ankara", "Yenimahalle"): ("39.9847", "32.7594"),
    ("Ankara", "Mamak"): ("39.9208", "32.9167"),
    ("Ankara", "Sincan"): ("39.9667", "32.5833"),
    # İzmir
    ("İzmir", "Konak"): ("38.4189", "27.1287"),
    ("İzmir", "Karşıyaka"): ("38.4598", "27.1049"),
    ("İzmir", "Bornova"): ("38.4697", "27.2142"),
    ("İzmir", "Çeşme"): ("38.3231", "26.3025"),
    ("İzmir", "Urla"): ("38.3228", "26.7686"),
    ("İzmir", "Bayraklı"): ("38.4622", "27.1586"),
    ("İzmir", "Gaziemir"): ("38.3250", "27.1333"),
    ("İzmir", "Narlıdere"): ("38.4025", "27.0283"),
    ("İzmir", "Buca"): ("38.3833", "27.1833"),
}

# Read the seed file
with open('/home/ubuntu/adil-pazar/seed-db.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

# Add latitude/longitude to each listing
for (city, district), (lat, lng) in coordinates.items():
    # Find pattern: city: "City", district: "District",
    pattern = f'city: "{city}",\n    district: "{district}",'
    replacement = f'city: "{city}",\n    district: "{district}",\n    latitude: "{lat}",\n    longitude: "{lng}",'
    content = content.replace(pattern, replacement)

# Write back
with open('/home/ubuntu/adil-pazar/seed-db.mjs', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Added coordinates to all listings!")
