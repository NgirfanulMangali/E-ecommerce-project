import shopCoLogo from "../assets/resources/shopCo.svg";
import facebookIcon from "../assets/resources/facebook icon.svg";
import instagramIcon from "../assets/resources/instagram icon.svg";
import twitterIcon from "../assets/resources/twitter icon.svg";
import githubIcon from "../assets/resources/github icon.svg";
import visaIcon from "../assets/resources/visa icon.svg";
import paypalIcon from "../assets/resources/paypal icon.svg";
import applePayIcon from "../assets/resources/pay apple icon.svg";
import googlePayIcon from "../assets/resources/payment google icon.svg";

function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.8fr_1fr_1fr_1fr]">
          <div className="rounded-[32px] bg-white/5 p-6 sm:p-8">
            <div className="rounded-[30px] bg-white p-6 text-black sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-black/50">
                Stay up to date
              </p>
              <h2 className="mt-4 text-[28px] font-bold tracking-[-0.03em] sm:text-[32px]">
                About our latest offers
              </h2>
              <p className="mt-4 text-sm leading-7 text-black/60">
                Subscribe to get updates on new arrivals, exclusive deals, and the
                latest drops from Shop.co.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="h-12 w-full rounded-full border border-black/10 bg-white/90 px-5 text-sm text-black outline-none placeholder:text-black/40 sm:max-w-[320px]"
                />
                <button className="h-12 rounded-full bg-black px-6 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(0,0,0,0.12)] sm:w-auto">
                  Subscribe to Newsletter
                </button>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-6">
              <div>
                <img src={shopCoLogo} alt="Shop.co logo" className="h-8 w-auto" />
                <p className="mt-4 max-w-[360px] text-sm leading-7 text-white/60">
                  We have clothes that suits your style and which you’re proud to wear.
                  From women to men.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <a href="#" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:opacity-90">
                  <img src={facebookIcon} alt="Facebook" className="h-5 w-5" />
                </a>
                <a href="#" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:opacity-90">
                  <img src={twitterIcon} alt="Twitter" className="h-5 w-5" />
                </a>
                <a href="#" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:opacity-90">
                  <img src={instagramIcon} alt="Instagram" className="h-5 w-5" />
                </a>
                <a href="#" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-black transition hover:opacity-90">
                  <img src={githubIcon} alt="Github" className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 sm:grid-rows-[auto_auto] lg:grid-cols-1 lg:grid-rows-auto">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                Company
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-white/60">
                <li>About</li>
                <li>Features</li>
                <li>Works</li>
                <li>Career</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                Help
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-white/60">
                <li>Customer Support</li>
                <li>Delivery Details</li>
                <li>Terms & Conditions</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 sm:grid-rows-[auto_auto] lg:grid-cols-1 lg:grid-rows-auto">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                FAQ
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-white/60">
                <li>Account</li>
                <li>Manage Deliveries</li>
                <li>Orders</li>
                <li>Payment</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                Resources
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-white/60">
                <li>Free eBook</li>
                <li>Development Tutorial</li>
                <li>How to - Blog</li>
                <li>Youtube Playlist</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>Shop.co © 2020-2023, All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <img src={visaIcon} alt="Visa" className="h-5 w-auto" />
            <img src={paypalIcon} alt="PayPal" className="h-5 w-auto" />
            <img src={applePayIcon} alt="Apple Pay" className="h-5 w-auto" />
            <img src={googlePayIcon} alt="Google Pay" className="h-5 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
