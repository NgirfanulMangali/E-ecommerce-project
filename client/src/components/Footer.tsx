import shopCoLogo from "../assets/resources/shopCo.svg";
import facebookIcon from "../assets/resources/facebook icon.svg";
import instagramIcon from "../assets/resources/instagram icon.svg";
import twitterIcon from "../assets/resources/twitter icon.svg";
import githubIcon from "../assets/resources/github icon.svg";
import visaIcon from "../assets/resources/visa icon.svg";
import mastercardIcon from "../assets/resources/masterd card icon.svg";
import paypalIcon from "../assets/resources/paypal icon.svg";
import applePayIcon from "../assets/resources/pay apple icon.svg";
import googlePayIcon from "../assets/resources/payment google icon.svg";

function Footer() {
  return (
    <footer className="bg-[#F0F0F0] text-black">
      <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-8 sm:py-16">
        <div>
          <img src={shopCoLogo} alt="Shop.co logo" className="h-8 w-auto" />
          <p className="mt-4 max-w-[360px] text-sm leading-7 text-black/60">
            We have clothes that suits your style and which you&apos;re proud to wear.
            From women to men.
          </p>

          <div className="mt-6 flex items-center gap-4">
            <a
              href="#"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition hover:opacity-90"
            >
              <img src={twitterIcon} alt="Twitter" className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition hover:opacity-90"
            >
              <img src={facebookIcon} alt="Facebook" className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition hover:opacity-90"
            >
              <img src={instagramIcon} alt="Instagram" className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition hover:opacity-90"
            >
              <img src={githubIcon} alt="Github" className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-black">
              Company
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-black/60">
              <li>About</li>
              <li>Features</li>
              <li>Works</li>
              <li>Career</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-black">
              Help
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-black/60">
              <li>Customer Support</li>
              <li>Delivery Details</li>
              <li>Terms & Conditions</li>
              <li>Privacy Policy</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-black">
              FAQ
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-black/60">
              <li>Account</li>
              <li>Manage Deliveries</li>
              <li>Orders</li>
              <li>Payment</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-black">
              Resources
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-black/60">
              <li>Free eBook</li>
              <li>Development Tutorial</li>
              <li>How to - Blog</li>
              <li>Youtube Playlist</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-black/10 pt-6 text-sm text-black/60">
          <p className="text-center">Shop.co © 2000-2023. All Rights Reserved.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="rounded-md bg-white px-2 py-1">
              <img src={visaIcon} alt="Visa" className="h-5 w-auto" />
            </div>
            <div className="rounded-md bg-white px-2 py-1">
              <img src={mastercardIcon} alt="Mastercard" className="h-5 w-auto" />
            </div>
            <div className="rounded-md bg-white px-2 py-1">
              <img src={paypalIcon} alt="PayPal" className="h-5 w-auto" />
            </div>
            <div className="rounded-md bg-white px-2 py-1">
              <img src={applePayIcon} alt="Apple Pay" className="h-5 w-auto" />
            </div>
            <div className="rounded-md bg-white px-2 py-1">
              <img src={googlePayIcon} alt="Google Pay" className="h-5 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
