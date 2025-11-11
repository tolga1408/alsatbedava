import re

# Read file
with open('/home/ubuntu/adil-pazar/seed-db.mjs', 'r', encoding='utf-8') as f:
    content = f.read()

# District coordinates
coords = {
    "Kadıköy": ("40.9873", "29.0251"),
    "Beşiktaş": ("41.0422", "29.0074"),
    "Sarıyer": ("41.1686", "29.0544"),
    "Şişli": ("41.0602", "28.9875"),
    "Üsküdar": ("41.0224", "29.0149"),
    "Bakırköy": ("40.9833", "28.8597"),
    "Maltepe": ("40.9336", "29.1272"),
    "Ataşehir": ("40.9827", "29.1237"),
    "Pendik": ("40.8783", "29.2333"),
    "Çankaya": ("39.9180", "32.8628"),
    "Keçiören": ("39.9808", "32.8625"),
    "Etimesgut": ("39.9478", "32.6750"),
    "Yenimahalle": ("39.9847", "32.7594"),
    "Mamak": ("39.9208", "32.9167"),
    "Sincan": ("39.9667", "32.5833"),
    "Konak": ("38.4189", "27.1287"),
    "Karşıyaka": ("38.4598", "27.1049"),
    "Bornova": ("38.4697", "27.2142"),
    "Çeşme": ("38.3231", "26.3025"),
    "Urla": ("38.3228", "26.7686"),
    "Bayraklı": ("38.4622", "27.1586"),
    "Gaziemir": ("38.3250", "27.1333"),
    "Narlıdere": ("38.4025", "27.0283"),
    "Buca": ("38.3833", "27.1833"),
}

# For each district, find and add coordinates
for district, (lat, lng) in coords.items():
    # Pattern: district: "District", followed by images (no latitude in between)
    pattern = f'district: "{district}",\n    images:'
    replacement = f'district: "{district}",\n    latitude: "{lat}",\n    longitude: "{lng}",\n    images:'
    content = content.replace(pattern, replacement)

# Write back
with open('/home/ubuntu/adil-pazar/seed-db.mjs', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed all coordinates!")
