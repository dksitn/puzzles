/* ----- R9 V6.1 Supabase 訪客專用 (新增 Inquiry 功能) ----- */
document.addEventListener('DOMContentLoaded', function() {
    
    // -----------------------------------------------------------------
    // 🔴 步驟一：填入你的 Supabase 金鑰
    // -----------------------------------------------------------------
    const SUPABASE_URL = 'https://rxsmiinxcciiboxjngux.supabase.co'; // ❗ 範例，請貼上你複製的 'Project URL'
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4c21paW54Y2NpaWJveGpuZ3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5Nzk2MDIsImV4cCI6MjA3NzU1NTYwMn0.icPAhASfz4BK0hSFDOSc2D2bMRv_NxfTKKZUl4Pwq2Y'; // ❗ 範例，請貼上你複製的 'anon (public)' Key
    
    // -----------------------------------------------------------------
    // 🔴 步驟二：初始化 Supabase Client
    // -----------------------------------------------------------------
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

    // -----------------------------------------------------------------
    // 🔴 步驟三：抓取 DOM 元素 (❗ R9 V6.1 升級 ❗)
    // -----------------------------------------------------------------
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const cardsContainer = document.getElementById('product-cards-container');

    // --- (R9 V6.1 新增：Modal 元素) ---
    const contactModal = document.getElementById('contact-modal');
    const contactForm = document.getElementById('contact-form');
    const closeModalButton = contactModal.querySelector('.close-button');
    const statusMessage = document.getElementById('contact-status-message');

    // -----------------------------------------------------------------
    // 🔴 步驟四：核心功能 (Read Products, Create Inquiries)
    // -----------------------------------------------------------------

    /**
     * (R) 讀取 (Read)：讀取並顯示所有商品 (維持 V5.7 邏輯)
     */
    async function fetchProducts() {
        loadingMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        cardsContainer.innerHTML = '';

        const { data: products, error } = await supabaseClient
            .from('products') 
            .select('*') 
            .gt('quantity', 0); // (R9: 沿用 V5.7 邏輯)

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
     * (R8) 渲染 (Render)：(❗❗ R9 V6.1 升級 ❗❗)
     */
    function renderProductCards(products) {
        if (!products || products.length === 0) {
            cardsContainer.innerHTML = '<p>目前沒有任何商品。</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            card.innerHTML = `
                <div class="product-info">
                    <h3 data-field="name">${product.name}</h3>
                    <p data-field="price">價格: $${product.price}</p>
                    <p data-field="quantity"><b>庫存: ${product.quantity}</b></p>
                    <p data-field="description">${product.description || ''}</p>
                </div>
                <div class="product-image-container">
                    <img src="${product.image_url || 'images/my-photo.png'}" alt="${product.name}" class="product-card-image">
                </div>
                <div class="button-container">
                    <button class="contact-button">聯繫購買</button>
                </div>
            `;
            
            // ❗ R9 V6.1 新增：綁定按鈕事件
            card.querySelector('.contact-button').addEventListener('click', () => {
                openContactModal(product);
            });
            
            cardsContainer.appendChild(card);
        });
    }

    // -----------------------------------------------------------------
    // 🔴 步驟五：Modal 控制與提交 (❗❗ R9 V6.1 新增 ❗❗)
    // -----------------------------------------------------------------

    /**
     * (U) 開啟聯繫 Modal
     */
    function openContactModal(product) {
        document.getElementById('modal-product-name').textContent = product.name;
        document.getElementById('modal-product-name-fk').value = product.name; // ❗ R9: 儲存 'name' (PKey)
        statusMessage.textContent = '';
        contactModal.style.display = 'block';
    }

    /**
     * (C) 新增 (Create)：處理「聯繫購買」表單
     */
    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // ❗ R6: 停止表單預設提交
        
        statusMessage.textContent = '正在送出詢問...';
        statusMessage.style.color = 'orange';

        const inquiryData = {
            client_name: document.getElementById('client-name').value,
            client_contact: document.getElementById('client-contact').value,
            inquiry_text: document.getElementById('inquiry-text').value,
            product_name_fk: document.getElementById('modal-product-name-fk').value // ❗ R9: 傳送 PKey
        };

        // (R9: Supabase API 呼叫 - ❗ 寫入 'customer_contacts' 表)
        const { data, error } = await supabaseClient
            .from('customer_contacts') // ❗ R9 修正：使用你 的新表名
            .insert(inquiryData);

        if (error) {
            console.error('Supabase 新增詢問錯誤:', error.message);
            statusMessage.textContent = `詢問失敗：${error.message}`;
            statusMessage.style.color = 'red';
        } else {
            statusMessage.textContent = '詢問已成功送出！我們將盡快與您聯繫。';
            statusMessage.style.color = 'green';
            
            setTimeout(() => {
                contactModal.style.display = 'none';
                contactForm.reset();
            }, 3000); // 3 秒後自動關閉
        }
    });

    // --- (Modal 關閉邏輯) ---
    closeModalButton.onclick = function() {
        contactModal.style.display = 'none';
    }
    window.onclick = function(event) {
        if (event.target == contactModal) {
            contactModal.style.display = 'none';
        }
    }

    // -----------------------------------------------------------------
    // 🔴 步驟六：啟動！
    // -----------------------------------------------------------------
    fetchProducts();
});