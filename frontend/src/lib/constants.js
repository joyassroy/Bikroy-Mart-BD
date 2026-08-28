export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api";

export const BANGLADESH_LOCATIONS = [
  {
    division: "Dhaka",
    districts: [
      { name: "Dhaka", upazilas: ["Adabor", "Badda", "Banani", "Bandar", "Bangshal", "Bhashantek", "Bimanbandar", "Cantonment", "Chackbair", "Dakshinkhan", "Dhanmondi", "Dohar", "Dumki", "Gazipur", "Gulshan", "Hazaribagh", "Jatrabari", "Kadamtali", "Kafrul", "Keraniganj", "Khilgaon", "Khilkhet", "Kotwali", "Lalbagh", "Meghna", "Mirpur", "Mohammadpur", "Motijheel", "Mugda", "Nayatola", "Newmarket", "Pallabi", "Paltan", "Ramna", "Rampura", "Rupganj", "Sabujbagh", "Savar", "Shah Ali", "Shahbagh", "Shahjahanpur", "Shyamoli", "Shyampur", "Singair", "Sutrapur", "Tejgaon", "Turag", "Uttara", "Uttarkhan", "Zindabazar"] },
      { name: "Gazipur", upazilas: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"] },
      { name: "Narayanganj", upazilas: ["Araihazar", "Bandar", "Fatullah", "Narayanganj Sadar", "Rupganj", "Sonargaon"] },
      { name: "Manikganj", upazilas: ["Daulatpur", "Ghior", "Harirampur", "Manikganj Sadar", "Saturia", "Shivalaya", "Singair"] },
      { name: "Munshiganj", upazilas: ["Gazaria", "Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar", "Tongibari"] },
      { name: "Narsingdi", upazilas: ["Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur"] },
      { name: "Tangail", upazilas: ["Basail", "Bhuapur", "Delduar", "Ghatail", "Gopalpur", "Jamalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar"] },
      { name: "Shariatpur", upazilas: ["Bhedarganj", "Damudya", "Gosairhat", "Naria", "Shakhipur", "Shariatpur Sadar"] },
    ],
  },
  {
    division: "Chattogram",
    districts: [
      { name: "Chattogram", upazilas: ["Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Chattogram Sadar", "Fatikchhari", "Hathazari", "Lohagara", "Mirsharai", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"] },
      { name: "Cox's Bazar", upazilas: ["Chakaria", "Cox's Bazar Sadar", "Kutubdia", "Maheshkhali", "Pekua", "Ramu", "Teknaf", "Ukhia"] },
      { name: "Bandarban", upazilas: ["Alikadam", "Bandarban Sadar", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"] },
      { name: "Khagrachhari", upazilas: ["Dighinala", "Khagrachhari Sadar", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"] },
      { name: "Rangamati", upazilas: ["Baghaichhari", "Barkal", "Juraichhari", "Kalampati", "Kaptai", "Langadu", "Naniarchar", "Rajasthali", "Rangamati Sadar"] },
      { name: "Feni", upazilas: ["Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Fulgazi", "Parshuram", "Sonagazi"] },
      { name: "Comilla", upazilas: ["Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Comilla Sadar", "Daudkandi", "Debidwar", "Homna", "Laksam", "Langalkot", "Meghna", "Monohorganj", "Muradnagar", "Nangalkot", "Titas"] },
      { name: "Brahmanbaria", upazilas: ["Akhaura", "Ashuganj", "Brahmanbaria Sadar", "Bancharampur", "Karimganj", "Kasba", "Nabinagar", "Nasirnagar", "Sarail"] },
      { name: "Chandpur", upazilas: ["Chandpur Sadar", "Faridganj", "Haimchar", "Haziganj", "Kachua", "Matlab Dakshin", "Matlab Uttar", "Shahrasti"] },
      { name: "Lakshmipur", upazilas: ["Kamalnagar", "Lakshmipur Sadar", "Raipura", "Ramganj", "Ramgati"] },
      { name: "Noakhali", upazilas: ["Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Kabirhat", "Noakhali Sadar", "Senbagh", "Sonaimuri", "Subarnachar"] },
    ],
  },
  {
    division: "Sylhet",
    districts: [
      { name: "Sylhet", upazilas: ["Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Osmani", "South Surma", "Sylhet Sadar", "Zakiganj"] },
      { name: "Moulvibazar", upazilas: ["Barlekha", "Juri", "Kamalganj", "Kulaura", "Moulvibazar Sadar", "Rajnagar", "Sreemangal"] },
      { name: "Habiganj", upazilas: ["Ajmiriganj", "Bahubal", "Baniachang", "Chunarughat", "Habiganj Sadar", "Lakhai", "Madhabpur", "Nabiganj"] },
      { name: "Sunamganj", upazilas: ["Bishwambarpur", "Chhatak", "Derai", "Dharmandal", "Jamalganj", "Patharkandi", "Salanjhana", "Sunamganj Sadar", "Tahirpur"] },
    ],
  },
  {
    division: "Rajshahi",
    districts: [
      { name: "Rajshahi", upazilas: ["Bagha", "Baghmara", "Boalia", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Rajshahi Sadar", "Tanore"] },
      { name: "Bogura", upazilas: ["Adamdighi", "Bogura Sadar", "Dhunat", "Dhupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Sherpur", "Shibganj", "Sonatola"] },
      { name: "Natore", upazilas: ["Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Natore Sadar", "Singra"] },
      { name: "Naogaon", upazilas: ["Atrai", "Badalgachi", "Dhamoirhat", "Manda", "Mahadevpur", "Naogaon Sadar", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"] },
      { name: "Chapainawabganj", upazilas: ["Bholahat", "Gomastapur", "Nachol", "Chapainawabganj Sadar", "Shibganj"] },
      { name: "Joypurhat", upazilas: ["Akkelpur", "Kalai", "Khetlal", "Panchbibi", "Joypurhat Sadar"] },
      { name: "Sirajganj", upazilas: ["Belkuchi", "Chauhali", "Kamarkhand", "Kazipur", "Raiganj", "Shahjadpur", "Sirajganj Sadar", "Tarash", "Ullahpara"] },
      { name: "Pabna", upazilas: ["Atgharia", "Bera", "Bhangura", "Chatmohar", "Ishwardi", "Pabna Sadar", "Santhia", "Sujanagar"] },
      { name: "Kushtia", upazilas: ["Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Kushtia Sadar", "Mirpur"] },
      { name: "Meherpur", upazilas: ["Gangni", "Meherpur Sadar", "Mujibnagar"] },
      { name: "Chuadanga", upazilas: ["Alamdanga", "Chuadanga Sadar", "Damurhuda", "Jibannagar"] },
    ],
  },
  {
    division: "Khulna",
    districts: [
      { name: "Khulna", upazilas: ["Batiaghata", "Dacope", "Dumuria", "Dighalia", "Khalishpur", "Khulna Sadar", "Koyra", "Paikgachha", "Phultala", "Rupsa", "Terokhada"] },
      { name: "Bagerhat", upazilas: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Rampal", "Sharankhola"] },
      { name: "Satkhira", upazilas: ["Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Satkhira Sadar", "Shyamnagar", "Tala"] },
      { name: "Jessore", upazilas: ["Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Jessore Sadar", "Manirampur", "Sharsha"] },
      { name: "Magura", upazilas: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"] },
      { name: "Narail", upazilas: ["Kalia", "Lohagara", "Narail Sadar", "Swapurpasha"] },
      { name: "Jhenaidah", upazilas: ["Harinakunda", "Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shakhipur"] },
    ],
  },
  {
    division: "Barishal",
    districts: [
      { name: "Barishal", upazilas: ["Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Barishal Sadar", "Gournadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"] },
      { name: "Patuakhali", upazilas: ["Bauphal", "Dasmina", "Dumki", "Galachipa", "Kalapara", "Mirzaganj", "Patuakhali Sadar", "Rangabali"] },
      { name: "Bhola", upazilas: ["Bhola Sadar", "Borhanuddin", "Charfassion", "Daulatkhan", "Lalmohan", "Manpura", "Tajumuddin"] },
      { name: "Pirojpur", upazilas: ["Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Pirojpur Sadar", "Rangabali", "Swarupkathi"] },
      { name: "Jhalakathi", upazilas: ["Jhalakathi Sadar", "Kathalia", "Nalchiti", "Rajapur"] },
      { name: "Barguna", upazilas: ["Amtali", "Barguna Sadar", "Betagi", "Bamna", "Patharghata", "Taltali"] },
    ],
  },
  {
    division: "Rangpur",
    districts: [
      { name: "Rangpur", upazilas: ["Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Rangpur Sadar", "Taraganj"] },
      { name: "Dinajpur", upazilas: ["Birampur", "Birganj", "Biral", "Chirirbandar", "Dinajpur Sadar", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"] },
      { name: "Thakurgaon", upazilas: ["Baliadangi", "Haripur", "Pirganj", "Ranisankail", "Thakurgaon Sadar"] },
      { name: "Lalmonirhat", upazilas: ["Aditmari", "Hativanga", "Kaliganj", "Lalmonirhat Sadar", "Patgram"] },
      { name: "Kurigram", upazilas: ["Bhurungamari", "Char Rajibpur", "Chilmari", "Kurigram Sadar", "Nageshwari", "Phulbari", "Rajarhat", "Raomari", "Ulipur"] },
      { name: "Gaibandha", upazilas: ["Fulchhari", "Gaibandha Sadar", "Gobindaganj", "Palashbari", "Sadullapur", "Sundarganj"] },
      { name: "Nilphamari", upazilas: ["Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Nilphamari Sadar", "Sadar", "Syedpur"] },
      { name: "Panchagarh", upazilas: ["Atwari", "Boda", "Debiganj", "Panchagarh Sadar", "Tetulia"] },
    ],
  },
  {
    division: "Mymensingh",
    districts: [
      { name: "Mymensingh", upazilas: ["Bhaluka", "Dobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Ishwarganj", "Mymensingh Sadar", "Nandail", "Phulpur", "Tarakanda", "Trishal"] },
      { name: "Jamalpur", upazilas: ["Bakshiganj", "Dewanganj", "Islampur", "Jamalpur Sadar", "Melandaha", "Sarishabari"] },
      { name: "Netrokona", upazilas: ["Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Kalmakanda", "Kendua", "Madan", "Mohanganj", "Netrokona Sadar", "Purbadhala"] },
      { name: "Sherpur", upazilas: ["Jhinaigati", "Nakla", "Nalitabari", "Sherpur Sadar", "Sribordi"] },
    ],
  },
];

export const DELIVERY_AREAS = BANGLADESH_LOCATIONS.map((d) => ({
  division: d.division,
  districts: d.districts.map((dist) => dist.name),
}));

export const ALL_DISTRICTS = BANGLADESH_LOCATIONS.flatMap((d) =>
  d.districts.map((dist) => ({ name: dist.name, division: d.division }))
);

export const ORDER_STATUSES = [
  { value: "PENDING", label: "Pending", color: "text-yellow-600 bg-yellow-50" },
  { value: "CONFIRMED", label: "Confirmed", color: "text-blue-600 bg-blue-50" },
  { value: "PROCESSING", label: "Processing", color: "text-indigo-600 bg-indigo-50" },
  { value: "SHIPPED", label: "Shipped", color: "text-purple-600 bg-purple-50" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", color: "text-orange-600 bg-orange-50" },
  { value: "DELIVERED", label: "Delivered", color: "text-green-600 bg-green-50" },
  { value: "CANCELLED", label: "Cancelled", color: "text-red-600 bg-red-50" },
];

export const PAYMENT_METHODS = [
  { value: "SSLCOMMERZ", label: "Online Payment" },
  { value: "COD", label: "Cash on Delivery" },
  { value: "BKASH", label: "bKash" },
  { value: "NAGAD", label: "Nagad" },
];

export const COLORS = {
  primary: { 50: "#E8EDF5", 100: "#C5D1E8", 200: "#8FA3D1", 300: "#5975BA", 400: "#2E4B8A", 500: "#00215B", 600: "#001A4A", 700: "#00143A", 800: "#000E2A", 900: "#00081A" },
  cta: { 50: "#FCE8F3", 100: "#F9B0DB", 200: "#F06EB5", 300: "#E85AA0", 400: "#EC008C", 500: "#D60071", 600: "#B8005C", 700: "#9A004D", 800: "#7C003E", 900: "#5E002F" },
  cyan: { 50: "#E8F4F8", 100: "#B3E3ED", 200: "#80D3E0", 300: "#4DC3D3", 400: "#26B3C9", 500: "#00AFCC", 600: "#009AB5", 700: "#00859E", 800: "#007087", 900: "#005B70" },
  navy: "#00215B",
  magenta: "#EC008C",
  charcoal: "#364152",
  slate: "#5A6C91",
  muted: "#667085",
  border: "#E5E7EB",
  surface: "#F0F2F5",
  surfaceLight: "#F9FAFB",
  error: "#FF6B6B",
  errorBg: "#FFF0F0",
};

export const getUpazilas = (division, district) => {
  const div = BANGLADESH_LOCATIONS.find((d) => d.division === division);
  if (!div) return [];
  const dist = div.districts.find((d) => d.name === district);
  return dist ? dist.upazilas : [];
};
