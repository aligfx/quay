export function createQuay(userOptions) {
  "use strict";

  var options = userOptions || {};
  var CHAT_DESKTOP_MQ = options.desktopMediaQuery || "(min-width: 1100px) and (hover: hover) and (pointer: fine)";
  function chatOnLaptop() {
    if (options.desktopOnly === false) return true;
    return window.matchMedia(CHAT_DESKTOP_MQ).matches;
  }

  if (!chatOnLaptop()) {
    return { destroy: function () {}, open: function () {}, close: function () {} };
  }

  if (!options.endpoint) {
    throw new Error("[Quay] options.endpoint is required");
  }

  var ENDPOINT = String(options.endpoint).replace(/\/$/, "");
  var STORE_KEY = options.storageKey || "quay_chat_v1";
  var POLL_MS = options.pollIntervalMs || 700;
  var POLL_SLOW_MS = options.pollSlowIntervalMs || 5000;
  var PRESENCE_MS = options.presenceIntervalMs || 8000;
  var ONLINE_SEC = options.onlineWithinSec || 90;
  var CHAT_TITLE = options.title || "Chat";
  var CHAT_FACE = options.avatar || "";
  var HOST_LABEL = options.hostLabel || options.title || "Host";
  var EMPTY_COPY = options.emptyText || "Send a message — replies show up here.";
  var PLACEHOLDER = options.placeholder || ("Message " + HOST_LABEL);
  var SUBTITLE = options.subtitle || "";
  var GATE_PLACEHOLDER = options.namePlaceholder || "Your name";
  var URL_RE = /(https?:\/\/[^\s<]+[^.,)\s])/gi;
  var NAME_ADJ = [
    "calm", "brisk", "quiet", "bold", "soft", "keen", "warm", "cool",
    "swift", "clear", "mild", "sharp", "open", "neat", "fair", "true",
  ];
  var NAME_NOUN = [
    "otter", "finch", "cedar", "pebble", "maple", "heron", "amber", "flint",
    "coral", "willow", "harbor", "pine", "lotus", "ridge", "grove", "tide",
  ];
  // Phosphor fill ChatCircle (viewBox 256)
  var ICON_CHAT =
    "M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,21.24,21.24l34.05-11.35A104,104,0,1,0,128,24Z";
  var ICON_ARROW_UP =
    "M205.66,117.66a8,8,0,0,1-11.32,0L136,59.31V216a8,8,0,0,1-16,0V59.31L61.66,117.66a8,8,0,0,1-11.32-11.32l72-72a8,8,0,0,1,11.32,0l72,72A8,8,0,0,1,205.66,117.66Z";
  var ICON_MINIMIZE =
    "M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80a8,8,0,0,1,11.32-11.32L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z";
  var ICON_PLUS =
    "M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z";
  var ICON_COPY =
    "M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z";
  var ICON_REPLY =
    "M232,200a8,8,0,0,1-16,0,88.1,88.1,0,0,0-88-88H51.31l34.35,34.34a8,8,0,0,1-11.32,11.32l-48-48a8,8,0,0,1,0-11.32l48-48A8,8,0,0,1,85.66,61.66L51.31,96H128A104.11,104.11,0,0,1,232,200Z";
  var ICON_CHECK =
    "M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z";
  var ICON_X =
    "M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z";
  var ICON_SETTINGS = [
    "M21.3175 7.14139L20.8239 6.28479C20.4506 5.63696 20.264 5.31305 19.9464 5.18388C19.6288 5.05472 19.2696 5.15664 18.5513 5.36048L17.3311 5.70418C16.8725 5.80994 16.3913 5.74994 15.9726 5.53479L15.6357 5.34042C15.2766 5.11043 15.0004 4.77133 14.8475 4.37274L14.5136 3.37536C14.294 2.71534 14.1842 2.38533 13.9228 2.19657C13.6615 2.00781 13.3143 2.00781 12.6199 2.00781H11.5051C10.8108 2.00781 10.4636 2.00781 10.2022 2.19657C9.94085 2.38533 9.83106 2.71534 9.61149 3.37536L9.27753 4.37274C9.12465 4.77133 8.84845 5.11043 8.48937 5.34042L8.15249 5.53479C7.73374 5.74994 7.25259 5.80994 6.79398 5.70418L5.57375 5.36048C4.85541 5.15664 4.49625 5.05472 4.17867 5.18388C3.86109 5.31305 3.67445 5.63696 3.30115 6.28479L2.80757 7.14139C2.45766 7.74864 2.2827 8.05227 2.31666 8.37549C2.35061 8.69871 2.58483 8.95918 3.05326 9.48012L4.0843 10.6328C4.3363 10.9518 4.51521 11.5078 4.51521 12.0077C4.51521 12.5078 4.33636 13.0636 4.08433 13.3827L3.05326 14.5354C2.58483 15.0564 2.35062 15.3168 2.31666 15.6401C2.2827 15.9633 2.45766 16.2669 2.80757 16.8741L3.30114 17.7307C3.67443 18.3785 3.86109 18.7025 4.17867 18.8316C4.49625 18.9608 4.85542 18.8589 5.57377 18.655L6.79394 18.3113C7.25263 18.2055 7.73387 18.2656 8.15267 18.4808L8.4895 18.6752C8.84851 18.9052 9.12464 19.2442 9.2775 19.6428L9.61149 20.6403C9.83106 21.3003 9.94085 21.6303 10.2022 21.8191C10.4636 22.0078 10.8108 22.0078 11.5051 22.0078H12.6199C13.3143 22.0078 13.6615 22.0078 13.9228 21.8191C14.1842 21.6303 14.294 21.3003 14.5136 20.6403L14.8476 19.6428C15.0004 19.2442 15.2765 18.9052 15.6356 18.6752L15.9724 18.4808C16.3912 18.2656 16.8724 18.2055 17.3311 18.3113L18.5513 18.655C19.2696 18.8589 19.6288 18.9608 19.9464 18.8316C20.264 18.7025 20.4506 18.3785 20.8239 17.7307L21.3175 16.8741C21.6674 16.2669 21.8423 15.9633 21.8084 15.6401C21.7744 15.3168 21.5402 15.0564 21.0718 14.5354L20.0407 13.3827C19.7887 13.0636 19.6098 12.5078 19.6098 12.0077C19.6098 11.5078 19.7888 10.9518 20.0407 10.6328L21.0718 9.48012C21.5402 8.95918 21.7744 8.69871 21.8084 8.37549C21.8423 8.05227 21.6674 7.74864 21.3175 7.14139Z",
    "M15.5195 12C15.5195 13.933 13.9525 15.5 12.0195 15.5C10.0865 15.5 8.51953 13.933 8.51953 12C8.51953 10.067 10.0865 8.5 12.0195 8.5C13.9525 8.5 15.5195 10.067 15.5195 12Z",
  ];
  var REACTIONS = [
    { emoji: "❤️", label: "Love" },
    { emoji: "👍", label: "Like" },
    { emoji: "👎", label: "Dislike" },
    { emoji: "😂", label: "Haha" },
    { emoji: "‼️", label: "Exclaim" },
    { emoji: "❓", label: "Question" },
  ];
  var REACTION_SET = {};
  REACTIONS.forEach(function (r) {
    REACTION_SET[r.emoji] = r.emoji;
    REACTION_SET[r.emoji.replace(/\uFE0F/g, "")] = r.emoji;
  });

  function asReactionEmoji(text) {
    var t = String(text || "").trim();
    if (!t || t.length > 8) return "";
    return REACTION_SET[t] || REACTION_SET[t.replace(/\uFE0F/g, "")] || "";
  }

  var SOUND_SEND = "release";
  var SOUND_RECV = "sparkle";
  var SOUND_OPEN = "bloom";
  var SOUND_CLOSE = "droplet";
  var soundOn = true;
  var cuePlay = function () {};
  function playSound(name, volume) {
    if (!soundOn) return;
    cuePlay(name, volume);
  }
  import("/assets/cuelume.js")
    .then(function (m) {
      if (m && typeof m.play === "function") {
        cuePlay = function (name, volume) {
          try {
            m.play(name, { volume: volume == null ? 0.35 : volume });
          } catch (e) {}
        };
      }
    })
    .catch(function () {});

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "className") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function phosphor(d, cls, box, evenodd) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", box || "0 0 256 256");
    s.setAttribute("fill", "currentColor");
    s.setAttribute("aria-hidden", "true");
    if (cls) s.setAttribute("class", cls);
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    if (evenodd) p.setAttribute("fill-rule", "evenodd");
    s.appendChild(p);
    return s;
  }

  var DOCK_FRAME =
    "M16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3Z";

  function strokeIcon(paths) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "none");
    s.setAttribute("aria-hidden", "true");
    (paths || []).forEach(function (d) {
      var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", d);
      p.setAttribute("stroke", "currentColor");
      p.setAttribute("stroke-width", "1.5");
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
      s.appendChild(p);
    });
    return s;
  }

  function formatPresence(unix) {
    if (!unix) return { text: "Last seen recently", online: false };
    var diff = Math.max(0, Math.floor(Date.now() / 1000) - unix);
    if (diff < ONLINE_SEC) return { text: "Online", online: true };
    if (diff < 3600) {
      var mins = Math.floor(diff / 60);
      return { text: "Last seen " + mins + "m ago", online: false };
    }
    if (diff < 86400) {
      var hrs = Math.floor(diff / 3600);
      return { text: "Last seen " + hrs + "h ago", online: false };
    }
    if (diff < 604800) {
      var days = Math.floor(diff / 86400);
      return { text: "Last seen " + days + "d ago", online: false };
    }
    try {
      return {
        text:
          "Last seen " +
          new Date(unix * 1000).toLocaleDateString([], { month: "short", day: "numeric" }),
        online: false,
      };
    } catch (e) {
      return { text: "Last seen a while ago", online: false };
    }
  }

  function firstUrl(text) {
    var m = String(text || "").match(URL_RE);
    return m && m[0] ? m[0] : "";
  }

  function hostnameOf(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (e) {
      return url;
    }
  }

  function loadState() {
    try {
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var k = localStorage.key(i);
        if (k && /^quay_chat_v\d+$/.test(k) && k !== STORE_KEY) {
          localStorage.removeItem(k);
        }
      }
      return JSON.parse(localStorage.getItem(STORE_KEY) || "null") || {};
    } catch (e) {
      return {};
    }
  }

  function clientInfoSync() {
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var info = {
      ua: navigator.userAgent || "",
      lang: navigator.language || "",
      langs: navigator.languages ? [].slice.call(navigator.languages, 0, 4) : [],
      tz: "",
      screen: (screen.width || 0) + "×" + (screen.height || 0),
      dpr: window.devicePixelRatio || 1,
      touch: navigator.maxTouchPoints || 0,
      scheme:
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      page: location.pathname + location.search,
      host: location.host,
      ref: document.referrer || "",
      cores: navigator.hardwareConcurrency || 0,
      mem: navigator.deviceMemory || 0,
      net: conn && conn.effectiveType ? conn.effectiveType : "",
      platform: navigator.platform || "",
      mobile: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || ""),
    };
    try {
      info.tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    } catch (e) {}
    return info;
  }

  function clientInfo() {
    var info = clientInfoSync();
    var ua = navigator.userAgentData;
    if (!ua || typeof ua.getHighEntropyValues !== "function") {
      return Promise.resolve(info);
    }
    return ua
      .getHighEntropyValues([
        "platform",
        "platformVersion",
        "model",
        "architecture",
        "bitness",
        "fullVersionList",
      ])
      .then(function (hint) {
        info.platform = hint.platform || info.platform;
        info.platformVersion = hint.platformVersion || "";
        info.model = hint.model || "";
        info.arch = [hint.architecture, hint.bitness].filter(Boolean).join(" ");
        if (hint.mobile === true || hint.mobile === false) info.mobile = hint.mobile;
        var list = hint.fullVersionList || ua.brands || [];
        info.brands = list.map(function (b) {
          var ver = b && b.version ? String(b.version).split(".")[0] : "";
          return ((b && b.brand) || "") + (ver ? " " + ver : "");
        });
        return info;
      })
      .catch(function () {
        return info;
      });
  }

  function mergeMessages(existing, incoming) {
    var map = {};
    (existing || []).forEach(function (m) {
      if (m && m.id) map[m.id] = m;
    });
    (incoming || []).forEach(function (m) {
      if (!m || !m.id) return;
      var prev = map[m.id];
      if (prev && prev.reactions && !m.reactions) {
        m = Object.assign({}, m, { reactions: prev.reactions });
      }
      if (prev && prev.replyTo && !m.replyTo) {
        m = Object.assign({}, m, {
          replyTo: prev.replyTo,
          replyText: prev.replyText,
          replyFrom: prev.replyFrom,
        });
      }
      map[m.id] = m;
    });
    return Object.keys(map)
      .map(function (k) {
        return map[k];
      })
      .sort(function (a, b) {
        return Number(a.ts || a.id) - Number(b.ts || b.id);
      })
      .slice(-80);
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function newSessionId() {
    var adj = NAME_ADJ[Math.floor(Math.random() * NAME_ADJ.length)];
    var noun = NAME_NOUN[Math.floor(Math.random() * NAME_NOUN.length)];
    var tail = Math.random().toString(36).slice(2, 4);
    return adj + "-" + noun + "-" + tail;
  }

  function cleanDisplayName(raw) {
    return String(raw || "")
      .replace(/[\u0000-\u001f·]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 24);
  }

  function cleanRole(raw) {
    return String(raw || "")
      .replace(/[\u0000-\u001f·]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40);
  }

  function formatTime(ts) {
    var ms = ts && /^\d+(\.\d+)?$/.test(String(ts)) ? Number(String(ts).split(".")[0]) * 1000 : Date.now();
    try {
      return new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  }

  function sanitizeHtml(html) {
    var tpl = document.createElement("template");
    tpl.innerHTML = String(html || "");
    var allowed = {
      A: true,
      STRONG: true,
      B: true,
      EM: true,
      I: true,
      U: true,
      S: true,
      CODE: true,
      PRE: true,
      BR: true,
      P: true,
    };

    function walk(node) {
      var kids = Array.prototype.slice.call(node.childNodes);
      kids.forEach(function (child) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (!allowed[child.tagName]) {
            var text = document.createTextNode(child.textContent || "");
            child.replaceWith(text);
            return;
          }
          if (child.tagName === "A") {
            var href = child.getAttribute("href") || "";
            if (!/^https?:\/\//i.test(href)) {
              child.replaceWith(document.createTextNode(child.textContent || ""));
              return;
            }
            child.setAttribute("target", "_blank");
            child.setAttribute("rel", "noopener noreferrer");
          }
          Array.prototype.slice.call(child.attributes).forEach(function (attr) {
            if (attr.name !== "href" && attr.name !== "target" && attr.name !== "rel") {
              child.removeAttribute(attr.name);
            }
          });
          walk(child);
        }
      });
    }

    walk(tpl.content);
    return tpl.innerHTML;
  }

  function clipText(s, n) {
    var t = String(s || "").replace(/\s+/g, " ").trim();
    if (t.length <= (n || 72)) return t;
    return t.slice(0, n || 72).replace(/\s+\S*$/, "") + "…";
  }

  function fillBubbleContent(bubble, m, from) {
    if (from === "host" && m.html) {
      bubble.innerHTML = sanitizeHtml(m.html);
      return;
    }
    fillLinkedText(bubble, m.text);
  }

  function reactionKey(list) {
    return (list || [])
      .map(function (r) {
        return (r.from || "") + ":" + (r.emoji || "");
      })
      .join("|");
  }

  function paintReactions(row, m) {
    var host = row.querySelector(".quay-reacts");
    if (!host) return false;
    var next = m.reactions || [];
    var key = reactionKey(next);
    if (host.getAttribute("data-key") === key) return false;
    host.setAttribute("data-key", key);
    host.textContent = "";
    next.forEach(function (r) {
      host.appendChild(
        el("span", {
          className: "quay-react-stamp" + (r.from === "you" ? " is-you" : ""),
          text: r.emoji,
          title: r.from === "you" ? "You" : HOST_LABEL,
        })
      );
    });
    row.classList.toggle("has-reacts", next.length > 0);
    var yours = "";
    next.forEach(function (r) {
      if (r.from === "you") yours = r.emoji;
    });
    var picks = row.querySelectorAll(".quay-react-pick");
    for (var i = 0; i < picks.length; i++) {
      picks[i].classList.toggle("is-on", picks[i].getAttribute("data-emoji") === yours);
    }
    return true;
  }

  function paintQuote(row, m, youName) {
    var cluster = row.querySelector(".quay-msg-cluster");
    if (!cluster || !m.replyTo) return false;
    var existing = cluster.querySelector(".quay-quote");
    var who = m.replyFrom === "you" ? youName || "You" : HOST_LABEL;
    var snippet = clipText(m.replyText || "", 88);
    var key = String(m.replyTo) + ":" + who + ":" + snippet;
    if (existing && existing.getAttribute("data-key") === key) return false;
    var quote = existing;
    if (!quote) {
      quote = el("button", {
        type: "button",
        className: "quay-quote",
        "aria-label": "Quoted message",
      });
      cluster.insertBefore(quote, cluster.firstChild);
    }
    quote.setAttribute("data-quote-id", m.replyTo);
    quote.setAttribute("data-key", key);
    quote.replaceChildren(
      el("strong", { className: "quay-quote-who", text: who }),
      el("span", { className: "quay-quote-text", text: snippet })
    );
    return true;
  }

  function keepQuoteOnLatestYou(messages, quoting) {
    if (!quoting || !quoting.id) return messages || [];
    var list = (messages || []).slice();
    var i;
    for (i = list.length - 1; i >= 0; i--) {
      if (!list[i] || list[i].from === "host") continue;
      if (list[i].replyTo) break;
      list[i] = Object.assign({}, list[i], {
        replyTo: quoting.id,
        replyText: quoting.text,
        replyFrom: quoting.from,
      });
      break;
    }
    return list;
  }

  function buildReactionTray() {
    return el(
      "div",
      {
        className: "quay-react-tray",
        role: "listbox",
        "aria-label": "Reactions",
      },
      REACTIONS.map(function (r) {
        return el("button", {
          type: "button",
          className: "quay-react-pick",
          "data-emoji": r.emoji,
          "aria-label": r.label,
          text: r.emoji,
        });
      })
    );
  }

  function buildMessageRow(m, from, animate, stacked, youName) {
    var variant = from === "host" ? "ghost" : "soft";
    var bubble = el("div", {
      className: "quay-bubble",
      "data-variant": variant,
    });
    fillBubbleContent(bubble, m, from);

    var stamps = el("div", { className: "quay-reacts", "aria-hidden": "true" });
    var mainKids = [bubble, stamps];
    if (from === "host") mainKids.splice(1, 0, buildReactionTray());
    var main = el("div", { className: "quay-bubble-main" }, mainKids);
    var wrapKids = [main];
    if (from === "host") {
      var replyBtn = el("button", {
        type: "button",
        className: "quay-msg-act quay-act-reply",
        "aria-label": "Reply",
        "data-tip": "Reply",
      });
      replyBtn.appendChild(phosphor(ICON_REPLY));
      var copyBtn = el("button", {
        type: "button",
        className: "quay-msg-act quay-act-copy",
        "aria-label": "Copy",
        "data-tip": "Copy",
      });
      copyBtn.appendChild(phosphor(ICON_COPY));
      var plus = el("button", {
        type: "button",
        className: "quay-msg-act quay-react-plus",
        "aria-label": "React",
        "data-tip": "React",
        "aria-haspopup": "true",
        "aria-expanded": "false",
      });
      plus.appendChild(phosphor(ICON_PLUS));
      wrapKids.push(el("div", { className: "quay-msg-actions" }, [replyBtn, copyBtn, plus]));
    }
    var wrap = el("div", { className: "quay-bubble-wrap" }, wrapKids);

    var quote = null;
    if (m.replyTo) {
      quote = el("button", {
        type: "button",
        className: "quay-quote",
        "data-quote-id": m.replyTo,
        "aria-label": "Quoted message",
      });
      quote.appendChild(
        el("strong", { className: "quay-quote-who", text: m.replyFrom === "you" ? youName || "You" : HOST_LABEL })
      );
      quote.appendChild(
        el("span", { className: "quay-quote-text", text: clipText(m.replyText || "", 88) })
      );
    }

    var cluster = el(
      "div",
      { className: "quay-msg-cluster" },
      quote ? [quote, wrap] : [wrap]
    );

    var contentKids = [];
    if (!stacked) {
      if (from === "host") {
        contentKids.push(el("div", { className: "quay-msg-label", text: HOST_LABEL }));
      } else if (youName && !m.replyTo) {
        contentKids.push(el("div", { className: "quay-msg-label", text: youName }));
      }
    }
    contentKids.push(cluster);
    contentKids.push(
      el("div", { className: "quay-msg-footer", text: formatTime(m.ts || m.id) })
    );

    var content = el("div", { className: "quay-msg-content" }, contentKids);
    var url = firstUrl(m.text);

    var row = el(
      "article",
      {
        className:
          "quay-row" + (stacked ? " is-stack" : "") + (animate ? " is-enter" : ""),
        "data-from": from,
        "data-msg-id": m.id,
        "aria-label": (from === "host" ? HOST_LABEL : youName || "Your") + " message",
      },
      [content]
    );

    if (animate) {
      var bub = row.querySelector(".quay-bubble");
      function onEnd(e) {
        if (!e.animationName || e.animationName.indexOf("quay-pop") === -1) return;
        row.classList.remove("is-enter");
        if (bub) bub.removeEventListener("animationend", onEnd);
      }
      if (bub) bub.addEventListener("animationend", onEnd);
    }

    paintReactions(row, m);
    return { row: row, url: url };
  }

  function isUrlOnly(text, url) {
    var t = String(text || "").trim();
    if (!t || !url) return false;
    var a = t.replace(/\/$/, "");
    var b = String(url).replace(/\/$/, "");
    return a === b || a === String(url) || t === url;
  }

  function richLinkCard(preview) {
    var href = preview.url || "";
    var site = preview.site || hostnameOf(href);
    var card = el("a", {
      className: "quay-linkcard" + (preview.image ? " has-media" : ""),
      href: href,
      target: "_blank",
      rel: "noopener noreferrer",
    });
    if (preview.image) {
      var img = el("img", {
        src: preview.image,
        alt: "",
        loading: "lazy",
        referrerpolicy: "no-referrer",
      });
      img.addEventListener("error", function () {
        var media = card.querySelector(".quay-linkcard-media");
        if (media) media.remove();
        card.classList.remove("has-media");
      });
      card.appendChild(el("div", { className: "quay-linkcard-media" }, [img]));
    }
    var body = el("div", { className: "quay-linkcard-body" }, [
      el("div", { className: "quay-linkcard-site" }, [
        el("img", {
          className: "quay-linkcard-favicon",
          src: "https://www.google.com/s2/favicons?sz=64&domain_url=" + encodeURIComponent(href),
          alt: "",
        }),
        el("em", { text: site }),
      ]),
      el("strong", { text: preview.title || site || href }),
    ]);
    if (preview.description) body.appendChild(el("span", { text: preview.description }));
    card.appendChild(body);
    return card;
  }

  function attachLinkPreview(row, url) {
    if (!url || !row) return;
    fetch(ENDPOINT + "/preview?url=" + encodeURIComponent(url), {
      method: "GET",
      mode: "cors",
      credentials: "omit",
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (preview) {
        if (!preview || !preview.ok || !row.parentNode) return;
        var existing = row.querySelector(".quay-linkcard");
        if (existing) existing.remove();
        var content = row.querySelector(".quay-msg-content");
        var footer = row.querySelector(".quay-msg-footer");
        var bubble = row.querySelector(".quay-bubble");
        if (!content) return;
        var card = richLinkCard(preview);
        card.classList.add("is-enter");
        if (footer) content.insertBefore(card, footer);
        else content.appendChild(card);
        if (bubble && isUrlOnly(bubble.textContent, url)) {
          row.classList.add("is-link-only");
        }
      })
      .catch(function () {});
  }

  function fillLinkedText(node, text) {
    var raw = String(text || "");
    var re = new RegExp(URL_RE.source, "gi");
    var last = 0;
    var match;
    while ((match = re.exec(raw))) {
      if (match.index > last) {
        node.appendChild(document.createTextNode(raw.slice(last, match.index)));
      }
      var href = match[0];
      var a = el("a", {
        href: href,
        target: "_blank",
        rel: "noopener noreferrer",
        text: href,
      });
      node.appendChild(a);
      last = match.index + href.length;
    }
    if (last < raw.length) node.appendChild(document.createTextNode(raw.slice(last)));
  }

  function mount() {
    if (document.querySelector(".quay")) return;

    var state = loadState();
    if (!state.sessionId) {
      state.sessionId = newSessionId();
      saveState(state);
    }
    if (options.position === "left") state.side = "left";
    if (options.position === "right") state.side = "right";
    soundOn = state.sound !== false;
    var pendingReacts = {};

    var statusDot = el("i", { className: "quay-status-dot", "aria-hidden": "true" });
    var statusText = el("span", { className: "quay-status-text", text: "Last seen recently" });
    var statusLine = el("span", { className: "quay-lastseen" }, [statusText]);
    var faceKids = [statusDot];
    if (CHAT_FACE) {
      faceKids.unshift(
        el("img", {
          className: "quay-face",
          src: CHAT_FACE,
          alt: "",
          width: "64",
          height: "64",
        })
      );
    }
    var who = el("div", { className: "quay-who" + (CHAT_FACE ? "" : " no-face") }, [
      el("span", { className: "quay-face-wrap", "aria-hidden": "true" }, faceKids),
      el("div", { className: "quay-meta" }, [
        el("strong", { id: "quay-title", text: CHAT_TITLE }),
        statusLine,
      ]),
    ]);
    var log = el("div", { className: "quay-log", role: "log", "aria-live": "polite" });
    var empty = el("p", { className: "quay-empty", text: EMPTY_COPY });
    log.appendChild(empty);

    var input = el("textarea", {
      name: "chat-message",
      rows: "1",
      maxlength: "2000",
      autocomplete: "off",
      autocorrect: "off",
      autocapitalize: "off",
      spellcheck: "false",
      placeholder: PLACEHOLDER,
      "aria-label": "Message",
    });
    var sendBtn = el("button", {
      type: "submit",
      className: "quay-send",
      "aria-label": "Send message",
      disabled: "true",
    });
    sendBtn.appendChild(phosphor(ICON_ARROW_UP));
    var replyClear = el("button", {
      type: "button",
      className: "quay-replybar-clear",
      "aria-label": "Cancel reply",
    });
    replyClear.appendChild(phosphor(ICON_X));
    var replyWho = el("strong", { className: "quay-replybar-who", text: HOST_LABEL });
    var replySnippet = el("span", { className: "quay-replybar-text" });
    var replyBar = el("div", { className: "quay-replybar" }, [
      el("div", { className: "quay-replybar-body" }, [replyWho, replySnippet]),
      replyClear,
    ]);
    var endChatBtn = el("button", {
      type: "button",
      className: "quay-end",
      text: "End chat",
    });
    var form = el("form", { className: "quay-form" }, [
      replyBar,
      el("div", { className: "quay-composer" }, [input, sendBtn]),
      el("div", { className: "quay-foot" }, [
        SUBTITLE ? el("p", { className: "quay-human", text: SUBTITLE }) : null,
        endChatBtn,
      ]),
    ]);

    var nameInput = el("input", {
      type: "text",
      name: "chat-name",
      className: "quay-gate-name",
      maxlength: "24",
      autocomplete: "off",
      autocapitalize: "words",
      autocorrect: "off",
      spellcheck: "false",
      placeholder: " ",
      "aria-label": "Your name",
    });
    var gateGo = el("button", {
      type: "submit",
      className: "quay-gate-go",
      text: "Continue",
      disabled: "true",
    });
    var gate = el("form", { className: "quay-gate" }, [
      el("p", { className: "quay-gate-copy", text: "What's your name?" }),
      nameInput,
      gateGo,
    ]);

    var closeBtn = el("button", {
      type: "button",
      className: "quay-close",
      "aria-label": "Minimize chat",
    });
    closeBtn.appendChild(phosphor(ICON_MINIMIZE));

    var settingsBtn = el("button", {
      type: "button",
      className: "quay-close quay-settings-btn",
      "aria-label": "Settings",
      "aria-expanded": "false",
      "aria-controls": "quay-settings",
    });
    settingsBtn.appendChild(strokeIcon(ICON_SETTINGS));

    var settingsName = el("input", {
      type: "text",
      className: "quay-field",
      maxlength: "24",
      autocomplete: "off",
      autocapitalize: "words",
      spellcheck: "false",
      "aria-label": "Your name",
    });
    settingsName.value = state.displayName || "";
    var settingsSound = el("button", {
      type: "button",
      className: "quay-switch",
      "aria-label": "Sound effects",
      "aria-pressed": soundOn ? "true" : "false",
    });
    var sideLeftBtn = el("button", {
      type: "button",
      className: "quay-seg-btn",
      "aria-label": "Left",
    });
    sideLeftBtn.appendChild(strokeIcon(["M9 3V21", DOCK_FRAME]));
    var sideRightBtn = el("button", {
      type: "button",
      className: "quay-seg-btn",
      "aria-label": "Right",
    });
    sideRightBtn.appendChild(strokeIcon(["M15 3V21", DOCK_FRAME]));
    var settingsSheet = el("div", { className: "quay-settings-sheet" }, [
      el("label", { className: "quay-field-wrap" }, [
        el("span", { text: "Your name" }),
        settingsName,
      ]),
      el("div", { className: "quay-settings-group" }, [
        el("div", { className: "quay-settings-row" }, [
          el("span", { className: "quay-settings-label", text: "Sound effects" }),
          settingsSound,
        ]),
        el("div", { className: "quay-settings-row" }, [
          el("span", { className: "quay-settings-label", text: "Position" }),
          el("div", {
            className: "quay-seg",
            role: "group",
            "aria-label": "Chat position",
          }, [sideLeftBtn, sideRightBtn]),
        ]),
      ]),
    ]);
    var settingsPane = el("div", {
      className: "quay-settings",
      id: "quay-settings",
    }, [settingsSheet]);
    var newChatBtn = el("button", {
      type: "button",
      className: "quay-new",
      text: "New Chat",
    });
    var endedPane = el("div", { className: "quay-ended" }, [
      el("p", { className: "quay-ended-copy", text: "Chat ended" }),
      newChatBtn,
    ]);

    var panel = el(
      "div",
      {
        className: "quay-panel",
        id: "quay-panel",
        role: "dialog",
        "aria-labelledby": "quay-title",
        "aria-hidden": "true",
      },
      [
        el("div", { className: "quay-bar" }, [
          who,
          el("div", { className: "quay-bar-actions" }, [settingsBtn, closeBtn]),
        ]),
        log,
        gate,
        form,
        endedPane,
        settingsPane,
      ]
    );

    var toggle = el(
      "button",
      {
        type: "button",
        className: "quay-toggle",
        "aria-expanded": "false",
        "aria-controls": "quay-panel",
        "aria-label": "Message " + HOST_LABEL,
      },
      [phosphor(ICON_CHAT), el("span", { className: "quay-unread", "aria-hidden": "true" })]
    );

    var root = el(
      "div",
      {
        className: "quay" + (options.desktopOnly === false ? " is-always-on" : ""),
      },
      [panel, toggle]
    );
    if (state.displayName) root.classList.add("has-name");
    if (state.side === "left") root.classList.add("is-left");
    if (state.ended) root.classList.add("is-ended");
    if (options.theme && typeof options.theme === "object") {

      Object.keys(options.theme).forEach(function (k) {

        var cssKey = k.indexOf("--") === 0 ? k : "--quay-" + k;

        root.style.setProperty(cssKey, options.theme[k]);

      });

    }

    if (options.className) root.className = (root.className + " " + options.className).trim();

    document.body.appendChild(root);

    function revealToggle() {
      var reduce =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      root.classList.add("is-ready");
      if (reduce) return;
      root.classList.add("is-arriving");
      window.setTimeout(function () {
        root.classList.remove("is-arriving");
      }, 820);
    }

    function afterLoad(fn) {
      if (document.readyState === "complete") {
        window.setTimeout(fn, 280);
        return;
      }
      window.addEventListener(
        "load",
        function () {
          window.setTimeout(fn, 280);
        },
        { once: true }
      );
    }

    afterLoad(revealToggle);

    var busy = false;
    var composing = false;
    var pollTimer = null;
    var live = null;
    var liveSid = "";
    var liveOpen = false;
    var settingsCloseTimer = null;
    var presenceTimer = null;
    var seen = {};
    var replyTarget = null;

    function messageById(id) {
      var list = state.messages || [];
      for (var i = 0; i < list.length; i++) {
        if (list[i] && String(list[i].id) === String(id)) return list[i];
      }
      return null;
    }

    function setReply(msg) {
      if (!msg || !msg.id) {
        replyTarget = null;
        root.classList.remove("is-replying");
        return;
      }
      replyTarget = {
        id: String(msg.id),
        text: msg.text || "",
        from: msg.from === "you" ? "you" : "host",
      };
      replyWho.textContent = replyTarget.from === "you" ? state.displayName || "You" : HOST_LABEL;
      replySnippet.textContent = clipText(replyTarget.text, 88);
      root.classList.add("is-replying");
      input.focus();
    }

    function flashRow(id) {
      var row = log.querySelector('[data-msg-id="' + id + '"]');
      if (!row) return;
      row.scrollIntoView({ block: "nearest", behavior: "smooth" });
      row.classList.remove("is-flash");
      void row.offsetWidth;
      row.classList.add("is-flash");
      window.setTimeout(function () {
        row.classList.remove("is-flash");
      }, 900);
    }

    replyClear.addEventListener("click", function () {
      setReply(null);
      input.focus();
    });

    function setUnread(on) {
      state.unread = !!on;
      saveState(state);
      root.classList.toggle("has-unread", state.unread);
      toggle.setAttribute(
        "aria-label",
        state.unread ? ("Message " + HOST_LABEL + ", unread reply") : ("Message " + HOST_LABEL)
      );
    }

    if (state.unread) setUnread(true);

    function lastChatRow() {
      var rows = log.querySelectorAll(".quay-row:not(.quay-typing)");
      return rows.length ? rows[rows.length - 1] : null;
    }

    function stackAgainst(from) {
      var prev = lastChatRow();
      if (!prev || prev.getAttribute("data-from") !== from) return false;
      prev.classList.add("has-follow");
      return true;
    }

    function setTyping(active) {
      var existing = log.querySelector(".quay-typing");
      if (!active) {
        if (!existing) return;
        var stacked = existing.classList.contains("is-stack");
        existing.remove();
        if (stacked) {
          var tail = lastChatRow();
          if (tail) tail.classList.remove("has-follow");
        }
        return;
      }
      if (existing) return;
      if (empty.parentNode) empty.remove();

      var stacked = stackAgainst("host");
      var kids = [];
      if (!stacked) kids.push(el("div", { className: "quay-msg-label", text: HOST_LABEL }));
      kids.push(
        el("div", { className: "quay-bubble", "data-variant": "ghost" }, [
          el("span", { className: "quay-typing-dots", "aria-hidden": "true" }, [
            el("i", { className: "quay-typing-dot" }),
            el("i", { className: "quay-typing-dot" }),
            el("i", { className: "quay-typing-dot" }),
          ]),
        ])
      );

      var row = el(
        "article",
        {
          className: "quay-row quay-typing is-enter" + (stacked ? " is-stack" : ""),
          "data-from": "host",
          "aria-label": "Host is typing",
        },
        [el("div", { className: "quay-msg-content" }, kids)]
      );

      log.appendChild(row);
      log.scrollTop = log.scrollHeight;
    }

    function setPresence(unix, status) {
      who.classList.remove("is-online", "is-status", "is-busy", "is-away", "is-work");
      statusLine.classList.remove("is-online", "is-status", "is-busy", "is-away", "is-work");
      if (status && status.text) {
        statusText.textContent = status.text;
        who.classList.add("is-status", "is-" + (status.tone || "busy"));
        statusLine.classList.add("is-status", "is-" + (status.tone || "busy"));
        return;
      }
      var info = formatPresence(unix);
      statusText.textContent = info.text;
      who.classList.toggle("is-online", info.online);
      statusLine.classList.toggle("is-online", info.online);
    }

    function checkLastSeen() {
      fetch(ENDPOINT + "/presence", {
        method: "GET",
        mode: "cors",
        credentials: "omit",
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (body) {
          if (!body || !body.ok) return;
          setPresence(body.lastSeen, body.status);
        })
        .catch(function () {});
    }

    function startLastSeen() {
      if (presenceTimer) return;
      checkLastSeen();
      presenceTimer = setInterval(checkLastSeen, PRESENCE_MS);
    }

    startLastSeen();

    function stampHostOnLast(emoji) {
      var rows = log.querySelectorAll(".quay-row:not(.quay-typing)");
      var target = rows[rows.length - 1];
      if (!target) return;
      var id = target.getAttribute("data-msg-id");
      var list = state.messages || [];
      var i;
      for (i = 0; i < list.length; i++) {
        if (String(list[i].id) !== String(id)) continue;
        var next = (list[i].reactions || []).filter(function (r) {
          return r.from !== "host";
        });
        next.push({ emoji: emoji, from: "host" });
        list[i] = Object.assign({}, list[i], { reactions: next });
        paintReactions(target, list[i]);
        saveState(state);
        return;
      }
      paintReactions(target, { id: id, reactions: [{ emoji: emoji, from: "host" }] });
    }

    function applyIncomingReacts(reacts) {
      if (!reacts) return;
      var changed = false;
      Object.keys(reacts).forEach(function (id) {
        var incoming = reacts[id] || [];
        var hostReacts = incoming.filter(function (r) {
          return r.from === "host";
        });
        var list = state.messages || [];
        var msg = null;
        var i;
        for (i = 0; i < list.length; i++) {
          if (String(list[i].id) !== String(id)) continue;
          var you = (list[i].reactions || []).filter(function (r) {
            return r.from === "you";
          });
          if (!you.length) {
            you = incoming.filter(function (r) {
              return r.from === "you";
            });
          }
          list[i] = Object.assign({}, list[i], { reactions: you.concat(hostReacts) });
          msg = list[i];
          changed = true;
          break;
        }
        var row = log.querySelector('[data-msg-id="' + id + '"]');
        if (row) paintReactions(row, msg || { id: id, reactions: incoming });
      });
      if (changed) saveState(state);
    }

    function renderMessages(messages, opts) {
      opts = opts || {};
      var had = false;
      var gotHost = false;
      var reacted = false;
      var list = messages || [];
      if (opts.sync) {
        list = mergeMessages(state.messages, list);
      }
      list.forEach(function (m) {
        if (!m || !m.id) return;
        if (seen[m.id]) {
          var existingRow = log.querySelector('[data-msg-id="' + m.id + '"]');
          if (existingRow) {
            if (paintReactions(existingRow, m)) reacted = true;
            if (paintQuote(existingRow, m, state.displayName)) reacted = true;
          }
          return;
        }
        seen[m.id] = true;
        if (empty.parentNode) empty.remove();

        var from = m.from === "host" || m.from === "ali" ? "host" : "you";
        if (from === "host") {
          var react = asReactionEmoji(m.text);
          if (react) {
            stampHostOnLast(react);
            reacted = true;
            return;
          }
          gotHost = true;
          setTyping(false);
        }

        had = true;

        var stacked = stackAgainst(from);
        var built = buildMessageRow(m, from, !!opts.animate, stacked, state.displayName);
        log.appendChild(built.row);
        if (built.url) attachLinkPreview(built.row, built.url);
      });
      if (had || reacted) {
        if (had) log.scrollTop = log.scrollHeight;
        if (opts.sync) {
          var cleaned = list.filter(function (msg) {
            return !(msg && msg.from === "host" && asReactionEmoji(msg.text));
          });
          state.messages = cleaned;
          saveState(state);
        }
      }
      if (opts.notify && gotHost) {
        setTyping(false);
        playSound(SOUND_RECV, 0.4);
        if (!root.classList.contains("is-open")) setUnread(true);
      }
    }

    if (state.messages && state.messages.length) {
      renderMessages(state.messages, { notify: false, animate: false });
    }

    function syncSend() {
      sendBtn.disabled = busy || !(input.value || "").trim();
    }

    function resizeInput() {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 120) + "px";
    }

    function clearInput() {
      try {
        input.setRangeText("", 0, (input.value || "").length, "end");
      } catch (e) {}
      input.value = "";
      input.defaultValue = "";
      resizeInput();
      syncSend();
    }

    input.addEventListener("input", function () {
      resizeInput();
      syncSend();
    });
    input.addEventListener("compositionstart", function () {
      composing = true;
    });
    input.addEventListener("compositionend", function () {
      composing = false;
    });
    input.addEventListener("keydown", function (e) {
      if (composing) return;
      if (e.key !== "Enter" || e.shiftKey) return;
      e.preventDefault();
      if (typeof form.requestSubmit === "function") form.requestSubmit();
      else form.dispatchEvent(new Event("submit", { cancelable: true }));
    });

    function setSettings(on) {
      if (settingsCloseTimer) {
        clearTimeout(settingsCloseTimer);
        settingsCloseTimer = null;
      }
      if (on) {
        root.classList.remove("is-settings-out");
        root.classList.add("is-settings");
        settingsBtn.setAttribute("aria-expanded", "true");
        closeReactTray();
        settingsName.value = state.displayName || "";
        syncSoundSwitch();
        syncSide();
        window.setTimeout(function () {
          settingsName.focus();
        }, 80);
        return;
      }
      settingsBtn.setAttribute("aria-expanded", "false");
      if (!root.classList.contains("is-settings")) {
        root.classList.remove("is-settings-out");
        return;
      }
      root.classList.remove("is-settings");
      root.classList.add("is-settings-out");
      settingsCloseTimer = window.setTimeout(function () {
        root.classList.remove("is-settings-out");
        settingsCloseTimer = null;
      }, 240);
    }

    function syncSoundSwitch() {
      settingsSound.classList.toggle("is-on", soundOn);
      settingsSound.setAttribute("aria-pressed", soundOn ? "true" : "false");
    }

    function chatSide() {
      return state.side === "left" ? "left" : "right";
    }

    function syncSide() {
      var left = chatSide() === "left";
      root.classList.toggle("is-left", left);
      sideLeftBtn.classList.toggle("is-on", left);
      sideRightBtn.classList.toggle("is-on", !left);
      sideLeftBtn.setAttribute("aria-pressed", left ? "true" : "false");
      sideRightBtn.setAttribute("aria-pressed", left ? "false" : "true");
    }

    var sideTimer = null;
    function setSide(side) {
      var next = side === "left" ? "left" : "right";
      if (chatSide() === next) return;
      state.side = next;
      saveState(state);
      var reduce =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        root.classList.remove("is-side-out", "is-side-in");
        syncSide();
        return;
      }
      if (sideTimer) window.clearTimeout(sideTimer);
      root.classList.remove("is-side-in");
      root.classList.add("is-side-out");
      sideTimer = window.setTimeout(function () {
        syncSide();
        root.classList.remove("is-side-out");
        root.classList.add("is-side-in");
        sideTimer = window.setTimeout(function () {
          root.classList.remove("is-side-in");
          sideTimer = null;
        }, 320);
      }, 180);
    }

    function saveProfile() {
      var name = cleanDisplayName(settingsName.value);
      if (name.length >= 2) {
        state.displayName = name;
        nameInput.value = name;
      } else {
        settingsName.value = state.displayName || "";
      }
      saveState(state);
    }

    function open() {
      root.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      setUnread(false);
      playSound(SOUND_OPEN, 0.36);
      window.setTimeout(function () {
        if (root.classList.contains("is-settings")) return;
        if (state.ended) {
          newChatBtn.focus();
          return;
        }
        if (state.displayName) input.focus();
        else nameInput.focus();
      }, 320);
      startPoll();
    }

    function close() {
      setSettings(false);
      root.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      playSound(SOUND_CLOSE, 0.28);
      setTyping(false);
      closeReactTray();
      startPoll();
    }

    function startPoll() {
      stopPoll();
      if (!state.sessionId || state.ended) return;
      startLive();
      pollTimer = setInterval(poll, liveOpen ? POLL_SLOW_MS : POLL_MS);
      poll();
    }

    function stopLive() {
      liveOpen = false;
      liveSid = "";
      if (live) {
        live.close();
        live = null;
      }
    }

    function applySync(sid, body) {
      if (sid !== state.sessionId) return;
      if (!body || !body.ok) return;
      if (body.threadTs && body.threadTs !== state.threadTs) state.threadTs = body.threadTs;
      if (body.sig && body.sig !== state.sig) {
        state.sig = body.sig;
        saveState(state);
      }
      if (body.ended) {
        setEnded();
        return;
      }
      setTyping(!!body.typing);
      setPresence(body.lastSeen, body.status);
      renderMessages(body.messages, { notify: true, sync: true, animate: true });
      applyIncomingReacts(body.reacts);
    }

    function startLive() {
      if (!window.EventSource || !state.sessionId || state.ended) return;
      if (live && liveSid === state.sessionId) return;
      stopLive();
      liveSid = state.sessionId;
      try {
        live = new EventSource(
          ENDPOINT + "/events?sessionId=" + encodeURIComponent(liveSid)
        );
      } catch (e) {
        live = null;
        liveSid = "";
        return;
      }
      live.addEventListener("chat", function (ev) {
        try {
          applySync(liveSid, JSON.parse(ev.data));
        } catch (e) {}
      });
      live.onopen = function () {
        liveOpen = true;
        stopPoll();
        if (!state.sessionId || state.ended) return;
        pollTimer = setInterval(poll, POLL_SLOW_MS);
      };
      live.onerror = function () {
        liveOpen = false;
      };
    }

    function closeReactTray() {
      var open = log.querySelector(".quay-row.is-reacting");
      if (!open) return;
      open.classList.remove("is-reacting");
      var plus = open.querySelector(".quay-react-plus");
      if (plus) plus.setAttribute("aria-expanded", "false");
    }

    function applyLocalReaction(messageId, emoji) {
      pendingReacts[messageId] = emoji || "";
      var list = state.messages || [];
      var msg = null;
      var i;
      for (i = 0; i < list.length; i++) {
        if (String(list[i].id) !== String(messageId)) continue;
        var prev = list[i].reactions || [];
        var next = prev.filter(function (r) {
          return r.from !== "you";
        });
        if (emoji) next.push({ emoji: emoji, from: "you" });
        list[i] = Object.assign({}, list[i], { reactions: next });
        msg = list[i];
        saveState(state);
        break;
      }
      if (!msg) {
        msg = { id: messageId, reactions: emoji ? [{ emoji: emoji, from: "you" }] : [] };
      }
      var row = log.querySelector('[data-msg-id="' + messageId + '"]');
      if (row) paintReactions(row, msg);
      return msg;
    }

    function postReaction(messageId, emoji) {
      fetch(ENDPOINT + "/react", {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          messageId: messageId,
          emoji: emoji || "",
          threadTs: state.threadTs || "",
          sig: state.sig || "",
        }),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (body) {
          if (!body || !body.ok || !body.messages) return;
          renderMessages(body.messages, { notify: false, sync: true, animate: false });
        })
        .catch(function () {});
    }

    var visitSent = false;
    var lastInfo = null;
    function postVisit() {
      if (visitSent || !state.sessionId || !state.displayName) return;
      visitSent = true;
      clientInfo().then(function (info) {
        lastInfo = info;
        fetch(ENDPOINT + "/visit", {
          method: "POST",
          mode: "cors",
          credentials: "omit",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: state.sessionId,
            name: state.displayName || "",
            role: state.role || "",
            info: info,
          }),
        })
          .then(function (res) {
            return res.json();
          })
          .then(function (body) {
            if (!body || !body.ok) {
              visitSent = false;
              return;
            }
            if (body.threadTs) state.threadTs = body.threadTs;
            if (body.sig) state.sig = body.sig;
            saveState(state);
          })
          .catch(function () {
            visitSent = false;
          });
      });
    }

    function wipeThread(keepName, opts) {
      opts = opts || {};
      stopLive();
      var name = keepName ? cleanDisplayName(state.displayName) : "";
      var keepSound = soundOn;
      var keepSide = chatSide();
      var keepRole = keepName ? state.role || "" : "";
      state = {
        sessionId: newSessionId(),
        sound: keepSound,
        side: keepSide,
      };
      if (name.length >= 2) state.displayName = name;
      if (keepRole) state.role = keepRole;
      soundOn = keepSound;
      saveState(state);
      seen = {};
      pendingReacts = {};
      visitSent = false;
      lastInfo = null;
      setReply(null);
      setSettings(false);
      closeReactTray();
      setTyping(false);
      log.textContent = "";
      empty.textContent = EMPTY_COPY;
      log.appendChild(empty);
      settingsName.value = name;
      nameInput.value = name;
      root.classList.remove("is-ended");
      endChatBtn.disabled = false;
      newChatBtn.disabled = false;
      if (name.length >= 2) root.classList.add("has-name");
      else root.classList.remove("has-name");
      syncNameHint();
      syncSoundSwitch();
      syncSide();
      if (opts.sound) playSound(opts.sound, opts.volume || 0.28);
      if (name.length >= 2) postVisit();
      window.setTimeout(function () {
        if (name.length >= 2) input.focus();
        else nameInput.focus();
      }, 80);
    }

    function resetChatKeepingName(sound) {
      wipeThread(true, sound ? { sound: sound, volume: 0.3 } : {});
      startPoll();
    }

    function setEnded(opts) {
      opts = opts || {};
      stopLive();
      if (state.ended && root.classList.contains("is-ended")) {
        stopPoll();
        return;
      }
      state.ended = true;
      saveState(state);
      root.classList.add("is-ended");
      endChatBtn.disabled = true;
      newChatBtn.disabled = false;
      setSettings(false);
      setReply(null);
      closeReactTray();
      setTyping(false);
      stopPoll();
      if (!opts.silent) playSound(SOUND_CLOSE, 0.3);
      if (root.classList.contains("is-open")) {
        window.setTimeout(function () {
          newChatBtn.focus();
        }, 80);
      }
    }

    if (state.ended) setEnded({ silent: true });
    else if (state.displayName) postVisit();
    syncSide();

    log.addEventListener("click", function (e) {
      var pick = e.target.closest(".quay-react-pick");
      if (pick) {
        e.preventDefault();
        e.stopPropagation();
        var row = pick.closest(".quay-row");
        if (!row || row.getAttribute("data-from") !== "host") return;
        var messageId = row.getAttribute("data-msg-id");
        var emoji = pick.getAttribute("data-emoji") || "";
        if (pick.classList.contains("is-on")) emoji = "";
        closeReactTray();
        applyLocalReaction(messageId, emoji);
        postReaction(messageId, emoji);
        playSound(emoji ? "tick" : "press", 0.28);
        return;
      }
      var copyBtn = e.target.closest(".quay-act-copy");
      if (copyBtn) {
        e.preventDefault();
        e.stopPropagation();
        var copyRow = copyBtn.closest(".quay-row");
        if (!copyRow || copyRow.getAttribute("data-from") !== "host") return;
        var copyMsg = messageById(copyRow.getAttribute("data-msg-id"));
        var copyText = (copyMsg && copyMsg.text) || "";
        if (!copyText) return;
        var done = function () {
          copyBtn.classList.add("is-copied");
          copyBtn.setAttribute("aria-label", "Copied");
          copyBtn.setAttribute("data-tip", "Copied");
          copyBtn.replaceChildren(phosphor(ICON_CHECK));
          window.setTimeout(function () {
            copyBtn.classList.remove("is-copied");
            copyBtn.setAttribute("aria-label", "Copy");
            copyBtn.setAttribute("data-tip", "Copy");
            copyBtn.replaceChildren(phosphor(ICON_COPY));
          }, 1200);
          playSound("tick", 0.24);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(copyText).then(done).catch(function () {});
        } else {
          done();
        }
        return;
      }
      var replyBtn = e.target.closest(".quay-act-reply");
      if (replyBtn) {
        e.preventDefault();
        e.stopPropagation();
        closeReactTray();
        var replyRow = replyBtn.closest(".quay-row");
        if (!replyRow || replyRow.getAttribute("data-from") !== "host") return;
        var replyMsg = messageById(replyRow.getAttribute("data-msg-id"));
        if (!replyMsg) return;
        setReply(replyMsg);
        playSound("press", 0.22);
        return;
      }
      var quote = e.target.closest(".quay-quote");
      if (quote) {
        e.preventDefault();
        e.stopPropagation();
        flashRow(quote.getAttribute("data-quote-id") || "");
        return;
      }
      var plus = e.target.closest(".quay-react-plus");
      if (plus) {
        e.preventDefault();
        e.stopPropagation();
        var host = plus.closest(".quay-row");
        if (!host || host.getAttribute("data-from") !== "host") return;
        var open = host.classList.contains("is-reacting");
        closeReactTray();
        if (!open) {
          host.classList.add("is-reacting");
          plus.setAttribute("aria-expanded", "true");
          playSound("press", 0.22);
        }
        return;
      }
      closeReactTray();
    });
    log.addEventListener("scroll", closeReactTray);
    panel.addEventListener("click", function (e) {
      if (!e.target.closest(".quay-react-plus, .quay-react-tray, .quay-msg-act")) {
        closeReactTray();
      }
    });

    startPoll();

    function stopPoll() {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
    }

    function poll() {
      if (!state.sessionId || state.ended) return;
      var sid = state.sessionId;
      fetch(ENDPOINT + "/poll", {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          threadTs: state.threadTs || "",
          sig: state.sig || "",
        }),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (body) {
          applySync(sid, body);
        })
        .catch(function () {});
    }

    toggle.addEventListener("click", function () {
      if (root.classList.contains("is-open")) close();
      else open();
    });
    closeBtn.addEventListener("click", close);
    settingsBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (root.classList.contains("is-settings")) {
        saveProfile();
        setSettings(false);
        if (state.displayName) input.focus();
        return;
      }
      setSettings(true);
    });
    settingsName.addEventListener("change", saveProfile);
    settingsName.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      e.preventDefault();
      saveProfile();
      setSettings(false);
      if (state.displayName) input.focus();
    });
    settingsPane.addEventListener("click", function (e) {
      if (e.target !== settingsPane) return;
      saveProfile();
      setSettings(false);
      if (state.displayName) input.focus();
    });
    settingsSound.addEventListener("click", function () {
      soundOn = !soundOn;
      state.sound = soundOn;
      saveState(state);
      syncSoundSwitch();
      if (soundOn) playSound("tick", 0.24);
    });
    sideLeftBtn.addEventListener("click", function () {
      setSide("left");
    });
    sideRightBtn.addEventListener("click", function () {
      setSide("right");
    });
    endChatBtn.addEventListener("click", function () {
      if (endChatBtn.disabled || state.ended) return;
      endChatBtn.disabled = true;
      setEnded();
      fetch(ENDPOINT + "/end", {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: state.sessionId }),
      }).catch(function () {});
    });
    newChatBtn.addEventListener("click", function () {
      if (!state.ended || newChatBtn.disabled) return;
      newChatBtn.disabled = true;
      resetChatKeepingName(SOUND_OPEN);
    });
    document.addEventListener("pointerdown", function (e) {
      if (!root.classList.contains("is-open")) return;
      if (root.contains(e.target)) return;
      close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !root.classList.contains("is-open")) return;
      if (log.querySelector(".quay-row.is-reacting")) {
        closeReactTray();
        return;
      }
      if (root.classList.contains("is-settings")) {
        saveProfile();
        setSettings(false);
        return;
      }
      if (replyTarget) {
        setReply(null);
        return;
      }
      close();
    });

    function syncNameHint() {
      var ok = cleanDisplayName(nameInput.value).length >= 2;
      gate.classList.toggle("has-value", ok);
      gateGo.disabled = !ok;
    }

    nameInput.addEventListener("input", syncNameHint);

    gate.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = cleanDisplayName(nameInput.value);
      if (name.length < 2) {
        nameInput.focus();
        return;
      }
      state.displayName = name;
      saveState(state);
      root.classList.add("has-name");
      playSound("ready", 0.3);
      postVisit();
      window.setTimeout(function () {
        input.focus();
      }, 80);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (state.ended) return;
      if (!state.displayName) {
        nameInput.focus();
        return;
      }
      if (busy || composing) return;
      var text = (input.value || "").trim();
      if (!text) return;

      busy = true;
      sendBtn.disabled = true;
      sendBtn.classList.add("is-pulse");
      window.setTimeout(function () {
        sendBtn.classList.remove("is-pulse");
      }, 450);
      clearInput();
      window.requestAnimationFrame(function () {
        clearInput();
        input.focus();
      });
      playSound(SOUND_SEND, 0.38);

      var optimisticId = "local-" + Date.now();
      var optimistic = {
        id: optimisticId,
        from: "you",
        text: text,
        ts: String(Math.floor(Date.now() / 1000)),
      };
      var quoting = replyTarget;
      if (quoting) {
        optimistic.replyTo = quoting.id;
        optimistic.replyText = quoting.text;
        optimistic.replyFrom = quoting.from;
      }
      setReply(null);
      renderMessages([optimistic], { notify: false, animate: true });

      fetch(ENDPOINT + "/send", {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: state.sessionId,
          name: state.displayName || "",
          role: state.role || "",
          text: text,
          threadTs: state.threadTs || "",
          sig: state.sig || "",
          replyTo: quoting ? quoting.id : "",
          replyText: quoting ? quoting.text : "",
          replyFrom: quoting ? quoting.from : "",
          info: lastInfo || clientInfoSync(),
        }),
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { res: res, body: body };
          });
        })
        .then(function (out) {
          if (!out.body || !out.body.ok) {
            delete seen[optimisticId];
            var stale = log.querySelector('[data-msg-id="' + optimisticId + '"]');
            if (stale) stale.remove();
            if (!log.children.length) log.appendChild(empty);
            input.value = text;
            resizeInput();
            if (out.body && out.body.ended) {
              setEnded();
              return;
            }
            playSound("error", 0.35);
            if (empty.parentNode) empty.textContent = "Didn't send. Try again.";
            if (quoting) setReply(quoting);
            return;
          }
          clearInput();
          setReply(null);
          delete seen[optimisticId];
          var pending = log.querySelector('[data-msg-id="' + optimisticId + '"]');
          if (pending) pending.remove();
          state.threadTs = out.body.threadTs;
          state.sig = out.body.sig;
          saveState(state);
          renderMessages(keepQuoteOnLatestYou(out.body.messages, quoting), {
            notify: false,
            sync: true,
            animate: false,
          });
          var held = pendingReacts[optimisticId];
          delete pendingReacts[optimisticId];
          if (held) {
            var real = (out.body.messages || [])
              .filter(function (m) {
                return m && m.from !== "host";
              })
              .pop();
            if (real && real.id) {
              applyLocalReaction(real.id, held);
              postReaction(real.id, held);
            }
          }
          startPoll();
          input.focus();
        })
        .catch(function () {
          delete seen[optimisticId];
          var stale = log.querySelector('[data-msg-id="' + optimisticId + '"]');
          if (stale) stale.remove();
          if (!log.children.length) log.appendChild(empty);
          input.value = text;
          resizeInput();
          playSound("error", 0.35);
          if (empty.parentNode) empty.textContent = "Didn't send. Try again.";
          if (quoting) setReply(quoting);
        })
        .finally(function () {
          busy = false;
          syncSend();
        });
    });
  }

  var api = {
    open: function () {},
    close: function () {},
    destroy: function () {},
  };

  function boot() {
    mount();
    var root = document.querySelector(".quay");
    if (root) {
      api.open = function () {
        var t = root.querySelector(".quay-toggle");
        if (t && !root.classList.contains("is-open")) t.click();
      };
      api.close = function () {
        var t = root.querySelector(".quay-toggle");
        if (t && root.classList.contains("is-open")) t.click();
      };
      api.destroy = function () {
        root.remove();
      };
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  return api;
}

export default createQuay;
