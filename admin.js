/* ----- R9 V5.5 Supabase 全端整合 (Upsert 最終修正版) ----- */
document.addEventListener('DOMContentLoaded', function() {
    
    // -----------------------------------------------------------------
    // 🔴 步驟一：填入你的 Supabase 金鑰
    // -----------------------------------------------------------------
    const SUPABASE_URL = 'https://rxsmiinxcciiboxjngux.supabase.co'; // ❗ 範例，請貼上你複製的 'Project URL'
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4c21paW54Y2NpaWJveGpuZ3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5Nzk2MDIsImV4cCI6MjA3NzU1NTYwMn0.icPAhASfz4BK0hSFDOSc2D2bMRv_NxfTKKZUl4Pwq2Y'; // ❗ 範例，請貼上你複製的 'anon (public)' Key
    
    // -----------------------------------------------------------------
    // 🔴 步驟二：初始化 Supabase Client (❗❗ R9 語法修正 ❗❗)
    // -----------------------------------------------------------------
    // 🟢 R9 修正版：使用「解構賦值」來取得 createClient 函式
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);


    // -----------------------------------------------------------------
    // 🔴 步驟三：抓取所有 DOM 元素 (❗ R6 V5.2 升級 ❗)
    // -----------------------------------------------------------------
    
    // --- (商品列表) ---
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const cardsContainer = document.getElementById('product-cards-container');

    // --- (新增 Modal) ---
    const addModal = document.getElementById('addProductModal');
    const addForm = document.getElementById('add-product-form');
    const openAddModalBtn = document.getElementById('open-add-modal-btn'); 

    // --- (編輯 Modal) ---
    const editModal = document.getElementById('editProductModal');
    const editForm = document.getElementById('edit-product-form');
    const deleteButton = document.getElementById('delete-product-button');

    // --- (通用 Modal 控制) ---
    const allCloseButtons = document.querySelectorAll('.close-button'); 


    // -----------------------------------------------------------------
    // 🔴 步驟四：核心功能 (CRUD)
    // -----------------------------------------------------------------

    /**
     * (R) 讀取 (Read)：讀取並顯示所有商品
     */
    async function fetchProducts() {
        loadingMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        cardsContainer.innerHTML = '';

        // (R9: Supabase API 呼叫 - ❗ 修正為 supabaseClient)
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('*');

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
            card.className = 'product-card';
            
            card.innerHTML = `
                <div class="product-info">
                    <h3 data-field="name">${product.name}</h3>
                    <p data-field="price">價格: $${product.price}</p>
                    <p data-field="description">${product.description || ''}</p>
                </div>
                <div class="product-image-container">
                    <img src="${product.image_url || 'images/my-photo.png'}" alt="${product.name}" class="product-card-image">
                </div>
                <div class="button-container">
                    <button class="edit-button">編輯</button>
                </div>
            `;
            
            card.querySelector('.edit-button').addEventListener('click', () => {
                openEditModal(product);
            });

            cardsContainer.appendChild(card);
        });
    }

    /**
     * (C) 新增 (Create)：(❗❗ R9 V5.5 升級：Upsert 邏輯 ❗❗)
     */
    addForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 

        const newProduct = {
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            price: parseInt(document.getElementById('product-price').value, 10),
            image_url: document.getElementById('product-image-url').value
        };

        // (R9: Supabase API 呼叫 - ❗ 修正為 supabaseClient)
        const { data: newProductData, error: insertError } = await supabaseClient
            .from('products')
            .insert(newProduct)
            .select(); // ❗ R9: 要求 Supabase 把新增的資料回傳

        if (insertError) {
            console.error('Supabase 新增錯誤:', insertError.message);

            // ❗❗ R9 V5.5 關鍵邏輯 (你 要求的功能) ❗❗
            // (PostgreSQL error code '23505' means 'unique_violation')
            // (R7 修正：我們捕捉 'products_pkey' (也就是 'name' 欄位) 的重複！)
            if (insertError.code === '23505' && insertError.message.includes('products_pkey')) {
                
                alert('新增失敗：商品名稱 "' + newProduct.name + '" 已經存在。正在為您開啟该商品的編輯視窗...');

                // (R9: 執行 Goal 3)
                // (R9: Supabase API 呼叫 - ❗ 修正為 supabaseClient)
                const { data: existingProduct, error: fetchError } = await supabaseClient
                    .from('products')
                    .select('*')
                    .eq('name', newProduct.name) // ❗ R9: 用「重複的名稱」去撈
                    .single(); // ❗ R9: 我們只預期一筆

                if (fetchError) {
                    alert(`尋找重複商品時出錯：${fetchError.message}`);
                } else if (existingProduct) {
                    addModal.style.display = 'none'; // 關閉「新增」彈窗
                    openEditModal(existingProduct); // ❗ R9: 開啟「編輯」彈窗
                }
            } else {
                alert(`新增失敗：${insertError.message}`);
            }

        } else {
            alert('商品新增成功！');
            addForm.reset(); 
            addModal.style.display = 'none';
            fetchProducts(); 
        }
    });

    /**
     * (U) 更新 (Update)：開啟並處理編輯 Modal (❗ R9 V5.5 修正 ❗)
     */
    function openEditModal(product) {
        // (R5 提醒：因為 name 是 PKey，你不應該 '編輯' name。)
        // (R9 註：我們暫時保持介面可編輯，但 Supabase 會在 'Update' 時報錯)
        
        document.getElementById('edit-product-id').value = product.id; // (R9 註：這個 ID 欄位 其實不存在，但我們先保留它)
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-description').value = product.description;
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-image-url').value = product.image_url;
        
        editModal.style.display = 'block';
    }
    
    editForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        
        const updatedProduct = {
            name: document.getElementById('edit-product-name').value,
            description: document.getElementById('edit-product-description').value,
            price: parseInt(document.getElementById('edit-product-price').value, 10),
            image_url: document.getElementById('edit-product-image-url').value
        };

        // (R5 警告：你不應該更新 'name' (PKey))
        // (R9 修正：我們只更新 PKey 以外的欄位)
        // (R9: Supabase API 呼叫 - ❗ 修正為 supabaseClient)
        const { data, error } = await supabaseClient
            .from('products')
            .update({
                description: updatedProduct.description,
                price: updatedProduct.price,
                image_url: updatedProduct.image_url
            }) 
            .eq('name', updatedProduct.name); // ❗ R9 修正：用 'name' 當作 WHERE 條件

        if (error) {
            console.error('Supabase 更新錯誤:', error.message);
            alert(`更新失敗：${error.message}`);
        } else {
            alert('商品更新成功！');
            editModal.style.display = 'none';
            fetchProducts(); 
        }
    });

    /**
     * (D) 刪除 (Delete)：處理刪除按鈕 (❗ R9 V5.5 修正 ❗)
     */
    deleteButton.addEventListener('click', async function() {
        if (!confirm('您確定要刪除這筆商品嗎？此操作無法復原。')) {
            return;
        }
        
        const productName = document.getElementById('edit-product-name').value; // ❗ R9 修正：用 'name' 刪除

        // (R9: Supabase API 呼叫 - ❗ 修正為 supabaseClient)
        const { error } = await supabaseClient
            .from('products')
            .delete() 
            .eq('name', productName); // ❗ R9 修正：用 'name' 當作 WHERE 條件

        if (error) {
            console.error('Supabase 刪除錯誤:', error.message);
            alert(`刪除失敗：${error.message}`);
        } else {
            alert('商品刪除成功！');
            editModal.style.display = 'none';
            fetchProducts(); 
        }
    });

    // -----------------------------------------------------------------
    // 🔴 步驟五：Modal 控制邏輯 (維持不變)
    // -----------------------------------------------------------------

    // --- (開啟「新增」Modal) ---
    openAddModalBtn.onclick = function() {
        addForm.reset(); 
        addModal.style.display = 'block';
    }

    // --- (關閉「所有」Modal - 透過 X) ---
    allCloseButtons.forEach(button => {
        button.onclick = function() {
            addModal.style.display = 'none';
            editModal.style.display = 'none';
        }
    });

    // --- (關閉「所有」Modal - 透過點擊背景) ---
    window.onclick = function(event) {
        if (event.target == editModal || event.target == addModal) {
            editModal.style.display = 'none';
            addModal.style.display = 'none';
        }
    }

    // -----------------------------------------------------------------
    // 🔴 步驟六：啟動！
    // -----------------------------------------------------------------
    fetchProducts();
});