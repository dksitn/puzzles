/* ----- R9 V5.6 Supabase 全端整合 (Quantity 升級版) ----- */
document.addEventListener('DOMContentLoaded', function() {
    
    // -----------------------------------------------------------------
    // 🔴 步驟一：填入你的 Supabase 金鑰
    // -----------------------------------------------------------------
    const SUPABASE_URL = 'https://rxsmiinxcciiboxjngux.supabase.co'; // ❗ 範例，請貼上你複製的 'Project URL'
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4c21paW54Y2NpaWJveGpuZ3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5Nzk2MDIsImV4cCI6MjA3NzU1NTYwMn0.icPAhASfz4BK0hSFDOSc2D2bMRv_NxfTKKZUl4Pwq2Y'; // ❗ 範例，請貼上你複製的 'anon (public)' Key
    
    // -----------------------------------------------------------------
    // 🔴 步驟二：初始化 Supabase Client (❗❗ R9 語法修正 ❗❗)
    // -----------------------------------------------------------------
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);


    // -----------------------------------------------------------------
    // 🔴 步驟三：抓取所有 DOM 元素 (❗ R6 V5.2 升級 ❗)
    // -----------------------------------------------------------------
    
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const cardsContainer = document.getElementById('product-cards-container');

    const addModal = document.getElementById('addProductModal');
    const addForm = document.getElementById('add-product-form');
    const openAddModalBtn = document.getElementById('open-add-modal-btn'); 

    const editModal = document.getElementById('editProductModal');
    const editForm = document.getElementById('edit-product-form');
    const deleteButton = document.getElementById('delete-product-button');

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
     * (R8) 渲染 (Render)：(❗❗ R9 V5.6 升級 ❗❗)
     */
    function renderProductCards(products) {
        if (!products || products.length === 0) {
            cardsContainer.innerHTML = '<p>目前沒有任何商品。</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // ❗ R9 V5.6 升級：新增 `product.quantity` 顯示
            card.innerHTML = `
                <div class="product-info">
                    <h3 data-field="name">${product.name}</h3>
                    <p data-field="price">價格: $${product.price}</p>
                    <p data-field="quantity"><b>數量: ${product.quantity}</b></p>
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
     * (C) 新增 (Create)：(❗❗ R9 V5.6 升級 ❗❗)
     */
    addForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 

        const newProduct = {
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            price: parseInt(document.getElementById('product-price').value, 10),
            image_url: document.getElementById('product-image-url').value,
            quantity: parseInt(document.getElementById('product-quantity').value, 10) // ❗ R9 V5.6 新增
        };

        const { data: newProductData, error: insertError } = await supabaseClient
            .from('products')
            .insert(newProduct)
            .select();

        if (insertError) {
            console.error('Supabase 新增錯誤:', insertError.message);

            if (insertError.code === '23505' && insertError.message.includes('products_pkey')) {
                alert('新增失敗：商品名稱 "' + newProduct.name + '" 已經存在。正在為您開啟该商品的編輯視窗...');

                const { data: existingProduct, error: fetchError } = await supabaseClient
                    .from('products')
                    .select('*')
                    .eq('name', newProduct.name) 
                    .single(); 

                if (fetchError) {
                    alert(`尋找重複商品時出錯：${fetchError.message}`);
                } else if (existingProduct) {
                    addModal.style.display = 'none'; 
                    openEditModal(existingProduct); 
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
     * (U) 更新 (Update)：(❗❗ R9 V5.6 升級 ❗❗)
     */
    function openEditModal(product) {
        document.getElementById('edit-product-id').value = product.id; 
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-description').value = product.description;
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-image-url').value = product.image_url;
        document.getElementById('edit-product-quantity').value = product.quantity; // ❗ R9 V5.6 新增
        
        editModal.style.display = 'block';
    }
    
    editForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        
        const updatedProduct = {
            name: document.getElementById('edit-product-name').value,
            description: document.getElementById('edit-product-description').value,
            price: parseInt(document.getElementById('edit-product-price').value, 10),
            image_url: document.getElementById('edit-product-image-url').value,
            quantity: parseInt(document.getElementById('edit-product-quantity').value, 10) // ❗ R9 V5.6 新增
        };
        
        const { data, error } = await supabaseClient
            .from('products')
            .update({
                description: updatedProduct.description,
                price: updatedProduct.price,
                image_url: updatedProduct.image_url,
                quantity: updatedProduct.quantity // ❗ R9 V5.6 新增
            }) 
            .eq('name', updatedProduct.name); 

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
     * (D) 刪除 (Delete)：(維持不變)
     */
    deleteButton.addEventListener('click', async function() {
        if (!confirm('您確定要刪除這筆商品嗎？此操作無法復原。')) {
            return;
        }
        
        const productName = document.getElementById('edit-product-name').value; 

        const { error } = await supabaseClient
            .from('products')
            .delete() 
            .eq('name', productName);

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

    openAddModalBtn.onclick = function() {
        addForm.reset(); 
        addModal.style.display = 'block';
    }

    allCloseButtons.forEach(button => {
        button.onclick = function() {
            addModal.style.display = 'none';
            editModal.style.display = 'none';
        }
    });

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