export default function Footer() {
  return (
    <footer className="mt-16 bg-ink text-white/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 text-sm md:grid-cols-4">
        <div>
          <h3 className="mb-3 font-display text-base font-semibold text-white">Kartify</h3>
          <p>Everything you need, delivered to your door — electronics, fashion, home and more.</p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Company</h4>
          <ul className="space-y-2">
            <li>About us</li>
            <li>Careers</li>
            <li>Press</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Help</h4>
          <ul className="space-y-2">
            <li>Track your order</li>
            <li>Returns &amp; refunds</li>
            <li>Contact support</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Policies</h4>
          <ul className="space-y-2">
            <li>Terms of use</li>
            <li>Privacy policy</li>
            <li>Shipping policy</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} Kartify. Built as a portfolio / learning project.
      </div>
    </footer>
  );
}
