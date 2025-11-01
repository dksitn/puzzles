/* ----- R9 V4.0 Supabase 全端整合 ----- */
document.addEventListener('DOMContentLoaded', function() {
    
    // -----------------------------------------------------------------
    // 🔴 步驟一：填入你的 Supabase 金鑰 (來自 R6 的 SOP 1)
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
    // 🔴 步驟三：抓取所有 DOM 元素
    // -----------------------------------------------------------------
    
    // --- (商品列表) ---
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const cardsContainer = document.getElementById('product-cards-container');

    // --- (新增表單) ---
    const addForm = document.getElementById('add-product-form');

    // --- (編輯 Modal) ---
    const editModal = document.getElementById('editProductModal');
    const editForm = document.getElementById('edit-product-form');
    const deleteButton = document.getElementById('delete-product-button');
    const closeModalButton = editModal.querySelector('.close-button');


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
            .from('products') // ❗ 來自你的資料表
            .select('*');     // ❗ 抓取所有欄位

        if (error) {
            // (R7: 偵錯)
            console.error('Supabase 讀取錯誤:', error.message);
            errorMessage.textContent = `讀取商品失敗：${error.message}`;
            errorMessage.style.display = 'block';
            loadingMessage.style.display = 'none';
        } else {
            // (R8: 渲染)
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
            
            // (R9: 建立卡片 HTML 結構)
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
            
            // (R6: 綁定編輯按鈕事件)
            card.querySelector('.edit-button').addEventListener('click', () => {
                openEditModal(product);
            });

            cardsContainer.appendChild(card);
        });
    }

    /**
     * (C) 新增 (Create)：處理新增表單
     */
    addForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // ❗ R6: 停止表單預設提交

        // (R6: 抓取表單資料)
        const newProduct = {
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            price: parseInt(document.getElementById('product-price').value, 10),
            image_url: document.getElementById('product-image-url').value
        };

        // (R9: Supabase API 呼叫 - ❗ 修正為 supabaseClient)
        const { data, error } = await supabaseClient
            .from('products')
            .insert(newProduct)
            .select(); // ❗ R9: 要求 Supabase 把新增的資料回傳

        if (error) {
            console.error('Supabase 新增錯誤:', error.message);
            alert(`新增失敗：${error.message}`);
        } else {
            alert('商品新增成功！');
            addForm.reset(); // (R6: 清空表單)
            fetchProducts(); // (R8: 重新整理列表)
        }
    });

    /**
     * (U) 更新 (Update)：開啟並處理編輯 Modal
     */
    function openEditModal(product) {
        // (R6: 填入 Modal 資料)
        document.getElementById('edit-product-id').value = product.id;
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-description').value = product.description;
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-image-url').value = product.image_url;
        
        editModal.style.display = 'block';
    }
    
    editForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // ❗ R6: 停止表單預設提交
        
        const productId = document.getElementById('edit-product-id').value;
        const updatedProduct = {
            name: document.getElementById('edit-product-name').value,
            description: document.getElementById('edit-product-description').value,
            price: parseInt(document.getElementById('edit-product-price').value, 10),
            image_url: document.getElementById('edit-product-image-url').value
        };

        // (R9: Supabase API 呼叫 - ❗ 修正為 supabaseClient)
        const { data, error } = await supabaseClient
            .from('products')
            .update(updatedProduct) // ❗ R9: 要更新的資料
            .eq('id', productId);     // ❗ R9: 更新哪一筆 (WHERE id = ...)

        if (error) {
            console.error('Supabase 更新錯誤:', error.message);
            alert(`更新失敗：${error.message}`);
        } else {
            alert('商品更新成功！');
            editModal.style.display = 'none';
            fetchProducts(); // (R8: 重新整理列表)
        }
    });

    /**
     * (D) 刪除 (Delete)：處理刪除按鈕
     */
    deleteButton.addEventListener('click', async function() {
        if (!confirm('您確定要刪除這筆商品嗎？此操作無法復原。')) {
            return;
        }
        
        const productId = document.getElementById('edit-product-id').value;

        // (R9: Supabase API 呼叫 - ❗ 修正為 supabaseClient)
        const { error } = await supabaseClient
            .from('products')
            .delete()             // ❗ R9: 刪除
            .eq('id', productId); // ❗ R9: 刪除哪一筆 (WHERE id = ...)

        if (error) {
            console.error('Supabase 刪除錯誤:', error.message);
            alert(`刪除失敗：${error.message}`);
        } else {
            alert('商品刪除成功！');
            editModal.style.display = 'none';
            fetchProducts(); // (R8: 重新整理列表)
        }
    });

    // --- (Modal 關閉邏輯) ---
    closeModalButton.onclick = function() {
        editModal.style.display = 'none';
    }
    window.onclick = function(event) {
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
    }

    // -----------------------------------------------------------------
    // 🔴 步驟五：啟動！
    // -----------------------------------------------------------------
    fetchProducts();
});