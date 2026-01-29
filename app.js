const DATA_URL = "http://localhost:3000/db.json";

const els = {
  grid: document.getElementById("grid"),
  status: document.getElementById("status"),
  searchInput: document.getElementById("searchInput"),
  sortTitleAsc: document.getElementById("sortTitleAsc"),
  sortTitleDesc: document.getElementById("sortTitleDesc"),
  sortPriceAsc: document.getElementById("sortPriceAsc"),
  sortPriceDesc: document.getElementById("sortPriceDesc"),
};

let products = [];
let filtered = [];
let sortState = { key: "", dir: "" };
let searchTerm = "";

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
    els.grid.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted py-4">
          <p>❌ Không tìm thấy sản phẩm phù hợp.</p>
        </td>
      </tr>
    `;
    els.status.textContent = "";
    return;
  }

  els.status.textContent = `📊 Hiển thị ${items.length} sản phẩm`;
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
            <img src="${imageUrl}" alt="${item.title ?? ""}" referrerpolicy="no-referrer" class="product-image"
              onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}';">
          `
        : `<span class="text-muted">Không có ảnh</span>`;

      return `
        <tr>
          <td><span class="badge bg-secondary">${item.id ?? ""}</span></td>
          <td><strong>${item.title ?? ""}</strong></td>
          <td><span class="badge bg-info">${item.category?.name ?? "N/A"}</span></td>
          <td><strong class="text-success">${formatPrice(item.price || 0)}</strong></td>
          <td class="text-truncate" title="${item.description ?? ""}" style="max-width: 200px;">${item.description ?? ""}</td>
          <td><small class="text-muted">${formattedDate}</small></td>
          <td>${imageCell}</td>
        </tr>
      `;
    })
    .join("");
};

const applyFilters = () => {
  const term = searchTerm.trim().toLowerCase();
  let next = [...products];

  if (term) {
    next = next.filter((item) =>
      (item.title ?? "").toLowerCase().includes(term)
    );
  }

  if (sortState.key) {
    const { key, dir } = sortState;
    next.sort((a, b) => {
      if (key === "title") {
        const aTitle = (a.title ?? "").toLowerCase();
        const bTitle = (b.title ?? "").toLowerCase();
        if (aTitle < bTitle) return dir === "asc" ? -1 : 1;
        if (aTitle > bTitle) return dir === "asc" ? 1 : -1;
        return 0;
      }
      if (key === "price") {
        const aPrice = Number(a.price ?? 0);
        const bPrice = Number(b.price ?? 0);
        return dir === "asc" ? aPrice - bPrice : bPrice - aPrice;
      }
      return 0;
    });
  }

  filtered = next;
  renderRows(filtered);
};

const setSort = (key, dir) => {
  sortState = { key, dir };
  applyFilters();
};

window.onChanged = (event) => {
  searchTerm = event?.target?.value ?? "";
  applyFilters();
};

const loadData = async () => {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error("Dữ liệu không đúng định dạng.");
    }
    products = data;
    applyFilters();
  } catch (err) {
    els.status.innerHTML =
      `<div class="alert alert-danger mt-3" role="alert">` +
      `<strong>⚠️ Lỗi!</strong> Không thể tải dữ liệu. ` +
      `Kiểm tra lại DATA_URL trong app.js hoặc chắc chắn rằng máy chủ đang chạy.</div>`;
    console.error(err);
  }
};

els.sortTitleAsc?.addEventListener("click", () => setSort("title", "asc"));
els.sortTitleDesc?.addEventListener("click", () => setSort("title", "desc"));
els.sortPriceAsc?.addEventListener("click", () => setSort("price", "asc"));
els.sortPriceDesc?.addEventListener("click", () => setSort("price", "desc"));

loadData();
