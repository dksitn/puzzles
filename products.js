/* ----- R9 V5.1 Supabase 訪客專用 (Read-Only) ----- */
document.addEventListener('DOMContentLoaded', function() {
    
    // -----------------------------------------------------------------
    // 🔴 步驟一：填入你的 Supabase 金鑰 (與 admin.js 相同)
    // -----------------------------------------------------------------
    const SUPABASE_URL = 'https://rxsmiinxcciiboxjngux.supabase.co'; // ❗ 請貼上你複製的 'Project URL'
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4c21paW54Y2NpaWJveGpuZ3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5Nzk2MDIsImV4cCI6MjA3NzU1NTYwMn0.icPAhASfz4BK0hSFDOSc2D2bMRv_NxfTKKZUl4Pwq2Y'; // ❗ 請貼上你複製的 'anon (public)' Key
    
    // -----------------------------------------------------------------
    // 🔴 步驟二：初始化 Supabase Client
    // -----------------------------------------------------------------
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // -----------------------------------------------------------------
    // 🔴 步驟三：抓取 DOM 元素
    // -----------------------------------------------------------------
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const cardsContainer = document.getElementById('product-cards-container');

    // -----------------------------------------------------------------
    // 🔴 步驟四：核心功能 (R)
    // -----------------------------------------------------------------

    /**
     * (R) 讀取 (Read)：讀取並顯示所有商品
     */
    async function fetchProducts() {
        loadingMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        cardsContainer.innerHTML = '';

        const { data: products, error } = await supabase
            .from('products') // ❗ 來自你的資料表
            .select('*');     // ❗ 抓取所有欄位

        if (error) {
            console.error('Supabase 讀取錯誤:', error.message);
            errorMessage.textContent = `讀取商品失敗：${error.message}`;
            errorMessage.style.display = 'block';
            loadingMessage.style.display = 'none';
        } else {
            renderProductCards(products);
            loadingMessage.style.display = 'none';
        }
    }

    /**
     * (R8) 渲染 (Render)：將資料畫成卡片
     */
    function renderProductCards(products) {
        if (!products || products.length === 0) {
            cardsContainer.innerHTML = '<p>目前沒有任何商品。</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card'; // (R9: 套用 style.css)
            
            card.innerHTML = `
                <div class="product-info">
                    <h3 data-field="name">${product.name}</h3>
                    <p data-field="price">價格: $${product.price}</p>
                    <p data-field="description">${product.description || ''}</p>
                </div>
                <div class="product-image-container">
                    <img src="${product.image_url || 'images/my-photo.png'}" alt="${product.name}" class="product-card-image">
                </div>
                `;
            
            cardsContainer.appendChild(card);
        });
    }

    // -----------------------------------------------------------------
    // 🔴 步驟五：啟動！
    // -----------------------------------------------------------------
    fetchProducts();
});