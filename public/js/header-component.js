//header
const template = document.createElement("template");
template.innerHTML = `
<style>
header {
    background-color: rgba(255, 255, 255, 0.95);
    padding: 10px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    gap: 30px;
}

header img {
    border-radius: 8px;
    object-fit: cover;
}

header h1 {
    flex: 1;
    font-size: 32px;
    color: #333;
    font-weight: 600;
}

h2 {
    font-size: 32px;
    color: #333;
    font-weight: 600;
}

#button,
#buttons1,
#button2 {
    padding: 12px 24px;
    background-color: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

#button:hover,
#buttons1:hover,
#button2:hover {
    background-color: #764ba2;
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 798px) {
    header {
        flex-direction: column;
        gap: 15px;
    }

    header h1 {
        font-size: 22px;
    }

    #button,
    #buttons1,
    #button2 {
        width: 100%;
    }

}

@media (max-width: 480px) {
    header img {
        width: 50px;
        height: 50px;
    }

    header h1 {
        font-size: 18px;
    }

    #button,
    #buttons1,
    #button2 {
        padding: 8px 16px;
        font-size: 12px;
    }

}
</style>
<header>
      <img
        src="https://file.aiquickdraw.com/imgcompressed/img/compressed_3135f41871c4a719c8ce47f073d9e9ab.webp"
        alt="Shop Expenses Logo"
        width="70"
        height="70"
      />

      <h1>Expenses</h1>

      <button type="button" id="buttons1">Vender Bills</button>
      <button type="button" id="button">Data Management</button>
      <button type="button" id="button2">LogOut</button>
      </header>

`;

class HeaderComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));
  }
  connectedCallback() {
    const button = this.shadowRoot.getElementById("button");
    const venterBills = this.shadowRoot.getElementById("buttons1");
    const logout = this.shadowRoot.getElementById("button2");

    button.addEventListener("click", () => {
      const isHome = window.location.pathname.includes("home-page.html");

      if (isHome) {
        // already on home page → just open menu
        window.dispatchEvent(new Event("open-management"));
      } else {
        // coming from another page
        sessionStorage.setItem("openManagement", "true");
        window.location.href = "/home-Page.html";
      }
    });

    venterBills.addEventListener("click", () => {
      window.location.href = "/Vender_bills.html";
    });
    logout.addEventListener("click", () => {
      fetch("/logout").then(() => {
        document.cookie = "auth=; Max-Age=0; path=/";
        document.cookie = "authentication=; Max-Age=0; path=/";
        window.location.href = "/login.html";
      });
    });
  }
}

customElements.define("header-component", HeaderComponent);

const Management = document.createElement("template");
Management.innerHTML = `
<style>
#container {
    flex: 1;
    display: flex;
    gap: 20px;
    padding: 40px 30px;
    justify-content: center;
    align-items: center;
}

#container div {
    margin: 0;
}

#container button {
    padding: 15px 40px;
    background-color: #3751c7;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 18px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

#container button:hover {
    background-color: #764ba2;
    transform: translateY(-1px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
</style>
<div id="container">
      <div>
        <button type="button" id="Material" hidden>Material</button>
      </div>
      <div>
        <button type="button" id="Vender" hidden>Vender</button>
      </div>
    </div>

`;

//management
class ManagementComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(Management.content.cloneNode(true));
  }

  connectedCallback() {
    const materialBtn = this.shadowRoot.getElementById("Material");
    const venderBtn = this.shadowRoot.getElementById("Vender");

    // always start hidden (new page load)
    materialBtn.hidden = true;
    venderBtn.hidden = true;

    const toggleButtons = () => {
      materialBtn.hidden = false;
      venderBtn.hidden = false;
    };

    window.addEventListener("open-management", toggleButtons);

    // open after redirect (other page → home page)
    if (sessionStorage.getItem("openManagement")) {
      toggleButtons();
      sessionStorage.removeItem("openManagement");
    }

    materialBtn.addEventListener("click", () => {
      window.location.href = "/material.html";
    });

    venderBtn.addEventListener("click", () => {
      window.location.href = "/vender.html";
    });
  }
}

customElements.define("management-component", ManagementComponent);

//Footer
const Footertemplate = document.createElement("template");
Footertemplate.innerHTML = `
    <style>
    footer {
    background-color: rgba(255, 255, 255, 0.95);
    padding: 20px 30px;
    text-align: center;
    color: #666;
    font-size: 14px;
    box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
    position: fixed;
    width:100%;
    bottom: 0;
}
    </style>

    <footer>
      <p>© 2025 loki Shop Expenses side. All rights reserved.</p>
    </footer>
`;

class FooterComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(Footertemplate.content.cloneNode(true));
  }
}

customElements.define("footer-component", FooterComponent);

//Model
const Modeltemplate = document.createElement("template");

Modeltemplate.innerHTML = `
<style>
  #errorModal {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
  }

  .modal-box {
    background: #fff;
    padding: 20px;
    width: 400px;
    margin: 15% auto;
    border-radius: 8px;
    text-align: center;
  }
</style>

<div id="errorModal">
  <div class="modal-box">
    <h3>Error</h3>
    <p id="errorMessage"></p>
    <button id="okBtn">OK</button>
  </div>
</div>
`;

class ModelComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(Modeltemplate.content.cloneNode(true));
  }

  connectedCallback() {
    this.modal = this.shadowRoot.getElementById("errorModal");
    this.messageEl = this.shadowRoot.getElementById("errorMessage");
    this.okBtn = this.shadowRoot.getElementById("okBtn");

    this.okBtn.addEventListener("click", () => this.close());
  }

  show(message) {
    this.messageEl.innerText = message;
    this.modal.style.display = "block";
  }

  close() {
    this.modal.style.display = "none";
  }
}

customElements.define("model-component", ModelComponent);
