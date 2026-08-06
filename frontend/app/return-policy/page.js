import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Return & Refund Policy",
  description: "Bikroymart BD Return & Refund Policy - Learn about our return, refund, and exchange procedures.",
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-[900px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#00215B] mb-2">Return &amp; Refund Policy</h1>
        <p className="text-xs text-gray-500 mb-6">Last Updated: 09 July 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-[#00215B] mt-6 mb-3">স্বাগতম Bikroymart BD-এ।</h2>
            <p>আমাদের লক্ষ্য হলো গ্রাহকদের নিরাপদ, স্বচ্ছ এবং সন্তোষজনক কেনাকাটার অভিজ্ঞতা প্রদান করা। আপনি যদি কোনো কারণে আপনার অর্ডার নিয়ে সন্তুষ্ট না হন, তাহলে নিচের Return &amp; Refund Policy প্রযোজ্য হবে।</p>
            <p>Welcome to Bikroymart BD. At Bikroymart BD, customer satisfaction is our priority. We are committed to providing a transparent, fair, and hassle-free shopping experience.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#00215B] mt-6 mb-3">১. রিটার্নের সময়সীমা / 1. Return Eligibility &amp; Timeframe</h2>

            <h3 className="text-base font-semibold text-[#00215B] mt-4 mb-2">Local Grocery Delivery (Within Our Service Area)</h3>
            <p>যদি পণ্যটি ভুল, ক্ষতিগ্রস্ত, ত্রুটিপূর্ণ অথবা অর্ডারের সাথে মিল না থাকে, তাহলে ডেলিভারির ২৪ ঘণ্টার মধ্যে আমাদের জানাতে হবে।</p>
            <p>If you receive an incorrect, damaged, or defective product, you must notify us within 24 hours of receiving the order.</p>

            <h3 className="text-base font-semibold text-[#00215B] mt-4 mb-2">Nationwide Delivery (Courier Service)</h3>
            <p>যেসব প্রোডাক্ট আমরা কুরিয়ারের মাধ্যমে সারা বাংলাদেশে পাঠাই, ডেলিভারি পাওয়ার পর ২-৩ দিনের মধ্যে রিটার্ন রিকোয়েস্ট করতে হবে।</p>
            <p>For products shipped via courier, return requests must be submitted within 2–3 days after receiving the product. Customers are responsible for the return shipping cost.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#00215B] mt-6 mb-3">২. যেসব ক্ষেত্রে রিটার্ন গ্রহণ করা হবে / 2. Eligible Return Reasons</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>ভুল পণ্য ডেলিভারি হলে / Wrong product delivered</li>
              <li>ক্ষতিগ্রস্ত বা ভাঙা অবস্থায় পণ্য পৌঁছালে / Product received in damaged or broken condition</li>
              <li>উৎপাদনগত ত্রুটি থাকলে / Manufacturing defect</li>
              <li>অর্ডারকৃত পণ্যের পরিবর্তে অন্য পণ্য পাওয়া গেলে / Incorrect item received</li>
              <li>পণ্যের সাইজ, রঙ বা স্পেসিফিকেশন ওয়েবসাইটের তথ্যের সাথে মিল না থাকলে / Product specs do not match description due to our error</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#00215B] mt-6 mb-3">৩. যেসব ক্ষেত্রে রিটার্ন গ্রহণযোগ্য নয় / 3. Non-Returnable Items</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>গ্রাহকের ব্যবহৃত, ধোয়া বা ক্ষতিগ্রস্ত পণ্য / Used, washed, or damaged products</li>
              <li>মূল প্যাকেজিং, ট্যাগ বা অ্যাক্সেসরিজ না থাকলে / Missing original packaging, tags, or accessories</li>
              <li>গ্রাহকের ভুল ব্যবহারের কারণে ক্ষতি হলে / Damage due to improper use</li>
              <li>ব্যক্তিগত ব্যবহার্য বা স্বাস্থ্যবিধি-সম্পর্কিত পণ্য (সিল খোলা হলে) / Personal care or hygiene products (if unsealed)</li>
              <li>ডিসকাউন্ট, ক্লিয়ারেন্স বা &quot;Final Sale&quot; পণ্য / Final sale or clearance items</li>
              <li>ডিজিটাল পণ্য, গিফট কার্ড / Digital products, gift cards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#00215B] mt-6 mb-3">৪. রিটার্নের শর্ত / 4. Return Conditions</h2>
            <p>রিটার্নের জন্য পণ্য অবশ্যই:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>অব্যবহৃত হতে হবে / Must be unused</li>
              <li>মূল প্যাকেজিংসহ ফেরত দিতে হবে / Must be returned in original packaging</li>
              <li>সকল ট্যাগ, ইনভয়েস এবং আনুষঙ্গিক সামগ্রীসহ থাকতে হবে / Must include all tags, invoice, and accessories</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#00215B] mt-6 mb-3">৫. রিফান্ড নীতিমালা / 5. Refund Policy</h2>
            <p>রিটার্নকৃত পণ্য আমাদের টিম যাচাই করার পর রিফান্ড প্রক্রিয়া শুরু হবে। রিফান্ড সম্পন্ন হতে সাধারণত ৩–৫ কার্যদিবস সময় লাগতে পারে।</p>
            <p>Refunds may be issued through:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mobile Banking (bKash, Nagad, Rocket)</li>
              <li>Bank Transfer</li>
              <li>The original payment method (where applicable)</li>
            </ul>
            <p>Cash on Delivery (COD) অর্ডারের ক্ষেত্রে গ্রাহকের প্রদত্ত Mobile Banking বা Bank Account-এ টাকা ফেরত দেওয়া হবে।</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#00215B] mt-6 mb-3">৬. এক্সচেঞ্জ / 6. Exchange Policy</h2>
            <p>নিচের ক্ষেত্রে পণ্য পরিবর্তন (Exchange) করা যাবে:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>ভুল সাইজ / Wrong size</li>
              <li>ভুল রঙ (আমাদের ভুল হলে) / Wrong color (due to our error)</li>
              <li>ত্রুটিপূর্ণ পণ্য / Defective product</li>
              <li>ভুল পণ্য ডেলিভারি / Incorrect product delivered</li>
            </ul>
            <p>স্টক উপলব্ধ থাকলে এক্সচেঞ্জ করা হবে। All exchanges are subject to product availability.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#00215B] mt-6 mb-3">৭. রিটার্ন প্রক্রিয়া / 7. Return Procedure</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>আপনার Order Number প্রস্তুত রাখুন। / Keep your Order Number ready.</li>
              <li>সমস্যার পরিষ্কার ছবি বা ভিডিও সংগ্রহ করুন। / Take clear photos or videos showing the issue.</li>
              <li>আমাদের Customer Support-এর সাথে যোগাযোগ করুন। / Contact our Customer Support team.</li>
              <li>নির্দেশনা অনুযায়ী পণ্য কুরিয়ারে পাঠান। / Send the product through the designated courier service.</li>
              <li>পণ্য যাচাই শেষে রিফান্ড বা এক্সচেঞ্জ সম্পন্ন করা হবে। / After inspection, your refund or exchange will be processed.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#00215B] mt-6 mb-3">৮. কুরিয়ার চার্জ / 8. Return Shipping Costs</h2>
            <p>যদি আমাদের ভুলের কারণে রিটার্ন হয়, তাহলে রিটার্ন ও পুনরায় ডেলিভারির সম্পূর্ণ খরচ Bikroymart BD বহন করবে।</p>
            <p>If the return is due to an error by Bikroymart BD, we will bear the full cost of return shipping and replacement delivery.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#00215B] mt-6 mb-3">৯. অর্ডার বাতিল / 9. Order Cancellation</h2>
            <p>অর্ডার শিপমেন্টের আগে যেকোনো সময় বাতিল করা যাবে। অর্ডার কুরিয়ারে হস্তান্তরের পর বাতিল করা সম্ভব নাও হতে পারে।</p>
            <p>Orders may be cancelled at any time before shipment. Once handed over to the courier, cancellation may no longer be possible.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#00215B] mt-6 mb-3">১০. রিফান্ড প্রত্যাখ্যান / 10. Refund Rejection</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>পণ্য ব্যবহৃত অবস্থায় ফেরত দিলে / Product returned used or damaged</li>
              <li>পণ্যের অংশ বা আনুষঙ্গিক সামগ্রী অনুপস্থিত / Missing accessories or parts</li>
              <li>ভুয়া বা বিভ্রান্তিকর রিটার্ন দাবি / False or fraudulent return claims</li>
              <li>রিটার্ন সময়সীমা অতিক্রম / Return request submitted after the return period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#00215B] mt-6 mb-3">১১. যোগাযোগ / 11. Contact Us</h2>
            <p>Return অথবা Refund সংক্রান্ত যেকোনো সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন।</p>
            <div className="bg-gray-50 rounded-lg p-4 mt-3">
              <p className="font-semibold text-[#00215B]">Bikroymart BD</p>
              <p>Email: bikroymartbd24@gmail.com</p>
              <p>Phone: 01713678644</p>
              <p>WhatsApp: 01713678644</p>
              <p>Facebook: <a href="https://www.facebook.com/bmaartbd" target="_blank" rel="noopener noreferrer" className="text-[#EC008C] hover:underline">facebook.com/bmaartbd</a></p>
              <p>Website: <a href="https://bmaart.com" target="_blank" rel="noopener noreferrer" className="text-[#EC008C] hover:underline">bmaart.com</a></p>
              <p className="mt-2 text-gray-500">Customer Support: শনিবার – বৃহস্পতিবার, সকাল ১০:০০টা – রাত ৯:০০টা</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
