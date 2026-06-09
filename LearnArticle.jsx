import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./global.css";
import "./LearnArticle.css";

function BitcoinLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#F7931A"/>
      <path d="M46.6 28.3c.6-4.2-2.6-6.5-7-8l1.4-5.7-3.5-.9-1.4 5.5-2.8-.7 1.4-5.5-3.5-.9-1.4 5.7-2.2-.6-4.8-1.2-.9 3.7s2.6.6 2.5.6c1.4.4 1.6 1.3 1.6 2l-1.6 6.4c.1 0 .2.1.4.1l-.4-.1-2.3 9c-.2.5-.7 1.2-1.8.9.0.1-2.5-.6-2.5-.6L15 42.6l4.5 1.1 2.5.6-1.5 5.8 3.5.9 1.5-5.8 2.8.7-1.4 5.7 3.5.9 1.4-5.7c5.9 1.1 10.3.7 12.2-4.7 1.5-4.3-.1-6.8-3.2-8.4 2.3-.5 4-2 4.4-5.4zm-7.9 11.1c-1.1 4.3-8.4 2-10.8 1.4l1.9-7.7c2.4.6 10.1 1.8 8.9 6.3zm1.1-11.2c-1 4-7.1 1.9-9.1 1.4l1.7-7c2 .5 8.5 1.5 7.4 5.6z" fill="white"/>
    </svg>
  );
}

function Pullquote({ children }) {
  return (
    <div className="art-pullquote">
      ⚡ {children}
    </div>
  );
}

function H2({ children }) {
  return <h2 className="art-h2">{children}</h2>;
}

function P({ children }) {
  return <p className="art-p">{children}</p>;
}

function Mono({ children }) {
  return <span className="art-mono">{children}</span>;
}

function PropertyRow({ name, bitcoin, fiat, winner }) {
  return (
    <div className="art-prop-row">
      <div className="art-prop-cell art-prop-cell--name">{name}</div>
      <div className={`art-prop-cell ${winner === "bitcoin" ? "art-prop-cell--good" : "art-prop-cell--bad"}`}>{bitcoin}</div>
      <div className={`art-prop-cell ${winner === "fiat" ? "art-prop-cell--good" : "art-prop-cell--bad"}`}>{fiat}</div>
    </div>
  );
}

function CompareRow({ property, bitcoin, cbdc }) {
  return (
    <div className="art-prop-row">
      <div className="art-prop-cell art-prop-cell--name">{property}</div>
      <div className="art-prop-cell art-prop-cell--good">✓ {bitcoin}</div>
      <div className="art-prop-cell art-prop-cell--bad">✗ {cbdc}</div>
    </div>
  );
}

const ARTICLES = {
  "what-is-bitcoin": {
    index: 0,
    label: "01 — What is Bitcoin?",
    title: "Bitcoin is not what most people think it is.",
    intro: "Not a company. Not a stock. Not \"crypto\" in the way the news means when they say crypto. Bitcoin is something genuinely new — and it's worth taking five minutes to understand what it actually is.",
    next: "bitcoin-as-money",
    nextLabel: "Bitcoin as Money →",
    content: () => (
      <>
        <H2>It has no CEO</H2>
        <P>
          Most things you use are run by someone. Google has a CEO. Your bank has a board. PayPal can freeze your account. These entities exist, make decisions, and can be pressured — by governments, by courts, by market forces.
        </P>
        <P>
          Bitcoin has none of that. It is a decentralised network — a set of rules agreed upon by thousands of computers around the world, running the same software, with no central point of control. There is no Bitcoin HQ. There is no phone number to call. There is no one who can change the rules unilaterally.
        </P>
        <Pullquote>No one can freeze your Bitcoin. No one can print more of it. No one can stop you from sending it.</Pullquote>

        <H2>21 million. That's it. Forever.</H2>
        <P>
          There will only ever be 21 million bitcoin. This is not a policy decision — it is written into the code and enforced by every node on the network. No government, no company, no developer can change this without the agreement of the entire network, which has shown zero interest in doing so.
        </P>
        <P>
          Compare this to the pound, the dollar, or any government currency. Those are printed — literally — whenever the people in charge decide they need more money. Bitcoin cannot be printed. The supply is fixed, transparent, and mathematically enforced.
        </P>

        <H2>It has been running since 2009</H2>
        <P>
          Bitcoin launched in January 2009. Not as a product — there was no company, no marketing, no investor round. It was published as open-source software by a pseudonymous developer called Satoshi Nakamoto, who then disappeared.
        </P>
        <P>
          Since then it has run continuously, 24 hours a day, 7 days a week, without a single day of downtime. No bank, no payment network, no internet company has a comparable uptime record.
        </P>

        <H2>It's not the same as altcoins</H2>
        <P>
          When people say "crypto," they usually mean a broad market that includes thousands of tokens, many of which have founders, investors, treasuries, and the ability to change their rules. Bitcoin is different. It is the only monetary network with no issuer, no company behind it, and a fixed supply that has never changed.
        </P>
        <P>
          TipBits uses Bitcoin specifically — not a broader basket of tokens — because Bitcoin is the only one with the monetary properties that make it worth earning.
        </P>
      </>
    ),
  },

  "bitcoin-as-money": {
    index: 1,
    label: "02 — Bitcoin as Money",
    title: "Money is a technology. Bitcoin is the best version of it yet.",
    intro: "People argue about whether Bitcoin is money. But money isn't a fixed thing — it's a tool humans invented to solve a coordination problem. And like any tool, some versions are better than others.",
    next: "bitcoin-vs-cbdc",
    nextLabel: "Bitcoin vs CBDCs →",
    content: () => (
      <>
        <H2>What makes good money?</H2>
        <P>
          Economists have identified six properties that make something work well as money. These aren't opinions — they're the practical requirements for a medium of exchange to function across time and distance.
        </P>

        <div className="art-table-header">
          <div className="art-table-header-cell art-table-header-cell--prop">Property</div>
          <div className="art-table-header-cell art-table-header-cell--btc">Bitcoin</div>
          <div className="art-table-header-cell art-table-header-cell--fiat">Fiat currency</div>
        </div>
        <PropertyRow name="Scarce" bitcoin="Fixed at 21 million" fiat="Printed at will" winner="bitcoin" />
        <PropertyRow name="Durable" bitcoin="Digital — lasts forever" fiat="Physical notes degrade" winner="bitcoin" />
        <PropertyRow name="Portable" bitcoin="Send anywhere instantly" fiat="Slow, restricted, expensive" winner="bitcoin" />
        <PropertyRow name="Divisible" bitcoin="Down to 1 satoshi (0.00000001 BTC)" fiat="Down to 1 penny" winner="bitcoin" />
        <PropertyRow name="Fungible" bitcoin="Every sat is equal" fiat="Mostly — serial numbers exist" winner="bitcoin" />
        <PropertyRow name="Recognisable" bitcoin="Cryptographically verifiable" fiat="Requires trust in institutions" winner="bitcoin" />

        <Pullquote>Scarcity is the one that matters most. You can't store value in something that can be created infinitely.</Pullquote>

        <H2>The scarcity problem with fiat money</H2>
        <P>
          Every pound, dollar, and euro in existence was created by a central bank or commercial bank. When governments need to spend money they don't have, they print it. When banks make loans, they create deposits out of nothing. This is not a conspiracy theory — it is how the system is designed and openly described.
        </P>
        <P>
          The result is that the money in your savings account buys less every year. Not because you've done anything wrong. Simply because there's more of it in circulation. This is inflation — the hidden tax on savings.
        </P>

        <H2>Why Bitcoin passes all six tests better than gold</H2>
        <P>
          Gold was the best money humans had for thousands of years. It's scarce, durable, fungible, and recognisable. But it's heavy, difficult to divide precisely, expensive to transport, and nearly impossible to send digitally. The 20th century ended the gold standard partly because physical gold couldn't move at the speed of the modern economy.
        </P>
        <P>
          Bitcoin has gold's scarcity and durability, but adds instant portability and near-infinite divisibility. One bitcoin is divisible into 100 million satoshis — you can send a fraction of a penny's worth anywhere in the world in seconds.
        </P>

        <H2>This is not a technical argument</H2>
        <P>
          Most people dismiss Bitcoin as a technology bet — will the network survive? Will the code hold up? Those are reasonable questions. But the core argument for Bitcoin is not technical. It is monetary.
        </P>
        <P>
          The question is: do you want to save in an asset with a fixed, predictable supply, or in one that can be expanded at the discretion of governments and central banks? Bitcoin is the first credible answer to that question in the history of money.
        </P>
      </>
    ),
  },

  "bitcoin-vs-cbdc": {
    index: 2,
    label: "03 — Bitcoin vs CBDCs",
    title: "Not all digital currency is the same. The difference matters enormously.",
    intro: "Most people assume that if something is digital and currency-shaped, it's roughly similar to Bitcoin. It isn't. A Central Bank Digital Currency (CBDC) and Bitcoin are opposite answers to the same question — and which one wins matters more than almost anything else in the next decade.",
    next: "what-is-lightning",
    nextLabel: "What is the Lightning Network? →",
    content: () => (
      <>
        <H2>What is a CBDC?</H2>
        <P>
          A Central Bank Digital Currency is a digital version of a national currency, issued and controlled directly by the central bank of a country. The UK is working on one (the "digital pound"). The EU has the digital euro in development. China already has the digital yuan in wide circulation.
        </P>
        <P>
          On the surface, this sounds like a sensible modernisation of money. Faster payments. No physical cash to carry. Better financial inclusion. These are the selling points.
        </P>
        <P>
          The reality of how the technology works is different.
        </P>

        <H2>What a CBDC can do that cash cannot</H2>
        <P>
          Cash is anonymous. When you hand someone a £20 note, there is no record of the transaction. No one knows you did it. No one can stop you doing it. No one can reverse it after the fact.
        </P>
        <P>
          A CBDC is programmable money running on a ledger controlled by the issuer. This means it can, technically, be programmed to:
        </P>
        <div className="art-cbdc-list">
          {[
            ["Track every transaction", "Every payment you make is visible to the issuer."],
            ["Freeze your balance", "Access to your money can be revoked without notice or recourse."],
            ["Set expiry dates", "Money that expires if not spent by a certain date — used to force spending."],
            ["Restrict spending categories", "Funds that can only be spent on approved goods or services."],
            ["Apply geographic limits", "Money that cannot be spent outside a defined area."],
          ].map(([title, body]) => (
            <div key={title} className="art-cbdc-item">
              <span className="art-cbdc-item-x">✗</span>
              <div>
                <div className="art-cbdc-item-title">{title}</div>
                <div className="art-cbdc-item-body">{body}</div>
              </div>
            </div>
          ))}
        </div>
        <P>
          To be clear: these are capabilities, not certainties. Most CBDC proposals being discussed publicly do not include all of these features. But the architecture makes them technically possible — and once the infrastructure exists, the question of whether they get used is a political one, not a technical one.
        </P>

        <Pullquote>The issue isn't whether governments would use these powers today. It's whether you want them to have these powers at all.</Pullquote>

        <H2>How Bitcoin compares on every axis</H2>
        <div className="art-table-header">
          <div className="art-table-header-cell art-table-header-cell--prop">Property</div>
          <div className="art-table-header-cell art-table-header-cell--btc">Bitcoin</div>
          <div className="art-table-header-cell art-table-header-cell--fiat">CBDC</div>
        </div>
        <CompareRow property="Issuer" bitcoin="None. No one controls Bitcoin." cbdc="Central bank controls issuance" />
        <CompareRow property="Surveillance" bitcoin="Pseudonymous — no identity required" cbdc="Every transaction is logged" />
        <CompareRow property="Censorship" bitcoin="No one can block a valid transaction" cbdc="Issuer can block any transaction" />
        <CompareRow property="Confiscation" bitcoin="Impossible without your private key" cbdc="Balance can be frozen or zeroed" />
        <CompareRow property="Supply" bitcoin="Fixed at 21 million forever" cbdc="Expanded at government discretion" />
        <CompareRow property="Permissioned" bitcoin="No permission needed to transact" cbdc="Transactions subject to policy rules" />

        <H2>This is not a conspiracy theory</H2>
        <P>
          The features described here are openly documented in CBDC research papers published by central banks including the Bank of England, the ECB, and the Bank for International Settlements. Programmability is presented as a feature, not a bug.
        </P>
        <P>
          The point here is not to be alarmist. It is to be precise. Bitcoin and CBDCs are not versions of the same thing. They are opposite answers to the question: who controls money?
        </P>
        <P>
          Bitcoin answers: no one. CBDCs answer: the state.
        </P>
        <P>
          That distinction is not technical preference. It is a question of financial sovereignty — the ability to transact, save, and receive payment without requiring the permission of any institution.
        </P>
      </>
    ),
  },

  "what-is-lightning": {
    index: 3,
    label: "04 — The Lightning Network",
    title: "Bitcoin is secure. It's also slow. Lightning fixes the slow part.",
    intro: "Bitcoin's base layer processes around 7 transactions per second. Visa handles around 24,000. If Bitcoin is going to be useful for everyday payments — including someone tipping a creator for a podcast — it needs a way to scale. That's what the Lightning Network is.",
    next: "why-creators",
    nextLabel: "Why This Matters for Creators →",
    content: () => (
      <>
        <H2>Why is Bitcoin slow by design?</H2>
        <P>
          Bitcoin deliberately limits its transaction throughput. Every transaction is broadcast to thousands of nodes worldwide, included in a block, and permanently recorded on a shared ledger. This process is slow and expensive because it's designed to be impossible to fake, reverse, or censor.
        </P>
        <P>
          Security and speed are in tension. Bitcoin chose security. The Lightning Network adds speed on top of it, without compromising the security underneath.
        </P>

        <H2>How payment channels work</H2>
        <P>
          Imagine you and a friend are splitting a tab at a pub over the course of an evening. Instead of settling every drink individually, you keep a running tally and settle up at the end. The Lightning Network works on the same principle — but cryptographically enforced.
        </P>
        <P>
          Two parties open a <Mono>payment channel</Mono> by locking some bitcoin into a shared Bitcoin transaction on the main chain. They can then send payments back and forth between themselves instantly, off-chain, as many times as they want. When they're done, they close the channel and the final balance is settled on the Bitcoin blockchain.
        </P>
        <P>
          The clever part: you don't need a direct channel with every person you want to pay. Payments route through a network of connected channels — your payment hops from node to node until it reaches the recipient, like a parcel moving through a postal network.
        </P>

        <Pullquote>Lightning payments are instant. Fees are typically a fraction of a penny. No bank, no intermediary, no waiting.</Pullquote>

        <H2>Lightning doesn't compromise Bitcoin's security</H2>
        <P>
          This is the key point. The Lightning Network is not a separate blockchain. It is built on top of Bitcoin. The base layer — the slow, secure, permanent record — remains the source of truth. Lightning just lets two parties transact efficiently without putting every micro-payment on that permanent record.
        </P>
        <P>
          If anything goes wrong in a Lightning channel, either party can broadcast their last agreed state to the Bitcoin blockchain and settle there. The security guarantee of Bitcoin underpins every Lightning transaction.
        </P>

        <H2>Not custodial by default</H2>
        <P>
          When you send sats over Lightning, the payment routes peer-to-peer through the network. There is no Lightning company holding your funds. The channels are secured by Bitcoin's cryptography — your keys control your channel balance.
        </P>
        <P>
          Some Lightning wallets are custodial (they hold the keys for you — simpler but requires trust). Others are non-custodial (you hold your own keys). TipBits works with any Lightning address, on any wallet, custodial or not — the choice is yours.
        </P>

        <H2>This is what TipBits uses</H2>
        <P>
          When someone tips a creator on TipBits, the payment happens over the Lightning Network. The creator's Lightning address resolves to a payment endpoint. An invoice is generated. The tipper pays it. The sats arrive in the creator's wallet in seconds. TipBits never touches the funds.
        </P>
        <P>
          That's the whole thing. Instant. Peer-to-peer. No intermediary.
        </P>
      </>
    ),
  },

  "why-creators": {
    index: 4,
    label: "05 — Why This Matters for Creators",
    title: "Platforms decide who gets paid. Lightning payments don't ask permission.",
    intro: "If you create anything on the internet — writing, podcasts, videos, music, code — you are dependent on platforms to get paid. Those platforms have the power to take that away. Bitcoin and Lightning change the equation.",
    next: null,
    content: () => (
      <>
        <H2>The platform problem</H2>
        <P>
          Every major payment platform comes with the same small print: we can suspend your account at any time, for any reason. Stripe. PayPal. Patreon. Ko-fi. YouTube. They are all intermediaries with their own terms, their own compliance teams, and the ability to freeze your income overnight.
        </P>
        <P>
          This isn't hypothetical. It has happened to thousands of creators — often with no warning, no explanation, and no recourse. Not because they did anything illegal. Because they fell foul of a platform's policies, or because a payment processor made a risk decision, or because a government asked nicely.
        </P>

        <Pullquote>Lightning payments are peer-to-peer. There is no platform in the middle. No one to call. No one to ask permission from.</Pullquote>

        <H2>What peer-to-peer actually means</H2>
        <P>
          When someone pays you over the Lightning Network, the sats go from their wallet to yours. There is no holding account. No settlement period. No minimum payout threshold. No percentage taken. No identity check. No compliance review.
        </P>
        <P>
          The sats land in your wallet — the wallet you control, with keys only you hold — in seconds. From anyone in the world. Including countries where traditional payment processors don't operate, or charge extortionate fees.
        </P>

        <H2>What TipBits does — and doesn't do</H2>
        <P>
          TipBits gives you a public tip page linked to your Lightning address. That's it. When someone pays you, the money flows directly from them to your Lightning provider. TipBits generates the page and facilitates the invoice — it never touches the funds, never holds a balance, and has no ability to intercept or redirect a payment.
        </P>
        <P>
          Your Lightning address is stored publicly (it has to be — it's how invoices get generated). Everything else is between you and your wallet.
        </P>

        <H2>The bigger picture</H2>
        <P>
          The internet made it possible for anyone to publish to the world. Bitcoin and Lightning make it possible for anyone to receive payment from the world — without a bank account, without a payment processor, without a platform's permission.
        </P>
        <P>
          This matters most to the people at the edges: creators in countries with weak banking infrastructure, journalists who write things governments don't like, builders who work on things platforms would rather not support.
        </P>
        <P>
          But it matters to everyone who creates things online. Because the right to get paid for your work should not depend on the goodwill of a third party whose terms of service can change at any time.
        </P>

        <div className="art-plain-terms">
          <div className="art-plain-terms-title">In plain terms</div>
          {[
            "No minimum payout — receive 1 sat or 1 million",
            "No settlement delay — sats arrive in seconds",
            "No geographic restrictions — anyone, anywhere",
            "No platform fee — Lightning routing fees are fractions of a penny",
            "No account suspension — no one can revoke your Lightning address",
          ].map(item => (
            <div key={item} className="art-plain-terms-item">
              <span className="art-plain-terms-icon">⚡</span>
              <span className="art-plain-terms-text">{item}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
};

const SLUGS = ["what-is-bitcoin", "bitcoin-as-money", "bitcoin-vs-cbdc", "what-is-lightning", "why-creators"];

export default function LearnArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    window.scrollTo(0, 0);
  }, [slug]);

  const article = ARTICLES[slug];

  if (!article) {
    return (
      <div className="art-not-found">
        <div className="art-not-found-inner">
          <div className="art-not-found-icon">⚡</div>
          <div className="art-not-found-title">Article not found</div>
          <button onClick={() => navigate('/learn')} className="art-not-found-btn">
            ← Back to Learn
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = SLUGS.indexOf(slug);

  return (
    <div className="art-page-root">
      <div className="bg-dots" />

      <div className={`art-wrap ${mounted ? "in" : ""}`}>

        {/* Nav */}
        <div className="art-nav">
          <div className="art-nav-brand" onClick={() => navigate('/')}>
            <BitcoinLogo size={28} />
            <span className="art-nav-brand-text">TipBits</span>
          </div>
          <button className="nav-link" onClick={() => navigate('/learn')}>← All topics</button>
        </div>

        {/* Progress dots */}
        <div className="art-progress">
          {SLUGS.map((s, i) => (
            <div
              key={s}
              className={`prog-step ${i === currentIndex ? "prog-step--current" : i < currentIndex ? "prog-step--done" : "prog-step--future"}`}
              onClick={() => navigate(`/learn/${s}`)}
            >
              {i < currentIndex ? "✓" : `0${i + 1}`}
            </div>
          ))}
          <span className="art-progress-label">{currentIndex + 1} of {SLUGS.length}</span>
        </div>

        {/* Article header */}
        <div className="art-header">
          <div className="art-header-eyebrow">
            {article.label}
          </div>
          <h1 className="art-header-h1">
            {article.title}
          </h1>
          <p className="art-header-intro">
            {article.intro}
          </p>
        </div>

        {/* Article body */}
        <div className="art-body-card">
          {article.content()}
        </div>

        {/* Next article */}
        {article.next && (
          <div
            onClick={() => navigate(`/learn/${article.next}`)}
            className="art-next-card"
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#F7931A"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.transform = "none"; }}
          >
            <div>
              <div className="art-next-label">Up next</div>
              <div className="art-next-title">{article.nextLabel}</div>
            </div>
            <span className="art-next-arrow">→</span>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="art-cta">
          <div className="art-cta-eyebrow">Ready to accept Bitcoin?</div>
          <h3 className="art-cta-h3">Create your TipBits page →</h3>
          <p className="art-cta-p">
            No email. No bank account. No permission needed. Your own sovereign tip page in under a minute.
          </p>
          <button onClick={() => navigate('/register')} className="art-cta-btn">
            ⚡ Create your TipBits page →
          </button>
        </div>

      </div>
    </div>
  );
}
