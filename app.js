const DATA_URL = "http://localhost:3000/db.json";

const els = {
  grid: document.getElementById("grid"),
  status: document.getElementById("status"),
};

let products = [];

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const proxyImage = (url) => {
  if (!url || typeof url !== "string") return "";
  if (!/^https?:\/\//i.test(url)) return url;
  const noProtocol = url.replace(/^https?:\/\//i, "");
  return `https://wsrv.nl/?url=${encodeURIComponent(noProtocol)}`;
};

const normalizeImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.includes("placeimg.com/")) {
    const match = url.match(/placeimg\.com\/(\d+)\/(\d+)\/([^/?#]+)/i);
    if (match) {
      return `https://placehold.co/${match[1]}x${match[2]}?text=${encodeURIComponent(
        match[3]
      )}`;
    }
    return "https://placehold.co/640x480?text=No+Image";
  }
  return url;
};

const PLACEHOLDER_IMAGE = "https://placehold.co/120x80?text=No+Image";

const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url);

const getDataOrigin = () => {
  try {
    return new URL(DATA_URL).origin;
  } catch (err) {
    return "";
  }
};

const resolveImageUrl = (item) => {
  const primary = normalizeImageUrl(item?.images?.[0] ?? "");
  if (primary && isAbsoluteUrl(primary)) return primary;

  const categoryImage = normalizeImageUrl(item?.category?.image ?? "");
  if (isAbsoluteUrl(categoryImage)) return categoryImage;

  return "";
};

const renderRows = (items) => {
  if (!items.length) {
    els.grid.innerHTML = "";
    els.status.textContent = "Khong tim thay san pham phu hop.";
    return;
  }

  els.status.textContent = "";
  els.grid.innerHTML = items
    .map((item) => {
      const date = new Date(item.creationAt || item.updatedAt);
      const formattedDate = isNaN(date.getTime())
        ? ""
        : date.toLocaleDateString("vi-VN");
      const rawImageUrl = resolveImageUrl(item);
      const imageUrl = rawImageUrl;
      const imageCell = imageUrl
        ? `
            <img src="${imageUrl}" alt="${item.title ?? ""}" referrerpolicy="no-referrer" style="max-width:120px; height:auto;"
              onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}';">
          `
        : "";

      return `
        <tr>
          <td>${item.id ?? ""}</td>
          <td>${item.title ?? ""}</td>
          <td>${item.category?.name ?? ""}</td>
          <td>${formatPrice(item.price || 0)}</td>
          <td>${item.description ?? ""}</td>
          <td>${formattedDate}</td>
          <td>${imageCell}</td>
        </tr>
      `;
    })
    .join("");
};

const loadData = async () => {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("Du lieu khong dung dinh dang.");
    }
    products = data;

    renderRows(products);
  } catch (err) {
    els.status.innerHTML =
      `<span class="error">Khong the tai du lieu. ` +
      `Kiem tra lai DATA_URL trong app.js.</span>`;
    console.error(err);
  }
};

loadData();
