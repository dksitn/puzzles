/* ----- R9 V5.9 Supabase 全端整合 (圖片上傳按鈕 升級版) ----- */
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
    // 🔴 步驟三：抓取所有 DOM 元素 (❗ R9 V5.9 升級 ❗)
    // -----------------------------------------------------------------
    
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const cardsContainer = document.getElementById('product-cards-container');

    const addModal = document.getElementById('addProductModal');
    const addForm = document.getElementById('add-product-form');
    const openAddModalBtn = document.getElementById('open-add-modal-btn'); 

    // ❗ R9 V5.9 新增：圖片上傳相關元素
    const triggerAddUploadBtn = document.getElementById('trigger-add-upload-btn'); // ❗ R6 新增
    const productImageFile = document.getElementById('product-image-file'); // ❗ R6 (隱藏的)
    const addImagePreview = document.getElementById('add-image-preview');


    const editModal = document.getElementById('editProductModal');
    const editForm = document.getElementById('edit-product-form');
    const deleteButton = document.getElementById('delete-product-button');

    // ❗ R9 V5.9 新增：編輯模式的圖片上傳相關元素
    const triggerEditUploadBtn = document.getElementById('trigger-edit-upload-btn'); // ❗ R6 新增
    const editProductImageFile = document.getElementById('edit-product-image-file'); // ❗ R6 (隱藏的)
    const editImagePreview = document.getElementById('edit-image-preview');


    const allCloseButtons = document.querySelectorAll('.close-button'); 


    // -----------------------------------------------------------------
    // 🔴 步驟四：輔助功能 (圖片上傳和預覽) (❗ R9 V5.9 升級 ❗)
    // -----------------------------------------------------------------

    /**
     * (R9 V5.8) 圖片上傳到 Supabase Storage
     */
    async function uploadImage(file) {
        if (!file) return null;

        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
        const filePath = `public/${fileName}`; 

        const { data, error } = await supabaseClient.storage
            .from('product-images') // ❗ 來自你 Supabase 建立的 Bucket 名稱
            .upload(filePath, file);

        if (error) {
            console.error('圖片上傳失敗:', error);
            alert(`圖片上傳失敗：${error.message}`);
            return null;
        }

        const { data: publicURLData } = supabaseClient.storage
            .from('product-images')
            .getPublicUrl(filePath);

        return publicURLData.publicUrl;
    }

    /**
     * (R9 V5.8) 預覽選取的圖片
     */
    function previewImage(fileInput, previewContainer) {
        previewContainer.innerHTML = '<p>無圖片預覽</p>'; 

        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                previewContainer.innerHTML = ''; 
                previewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    }

    // ❗❗ R6 V5.9 關鍵邏輯 ❗❗
    // 點擊「選擇檔案」按鈕，去觸發「隱藏的 <input type="file">」
    triggerAddUploadBtn.onclick = () => {
        productImageFile.click(); // 觸發 "add" 的 file input
    };
    triggerEditUploadBtn.onclick = () => {
        editProductImageFile.click(); // 觸發 "edit" 的 file input
    };

    // ❗❗ R6 V5.9 關鍵邏輯 ❗❗
    // 當「隱藏的 <input type="file">」真的選擇了檔案時，觸發「預覽」
    productImageFile.addEventListener('change', () => {
        previewImage(productImageFile, addImagePreview);
    });
    editProductImageFile.addEventListener('change', () => {
        previewImage(editProductImageFile, editImagePreview);
    });


    // -----------------------------------------------------------------
    // 🔴 步驟五：核心功能 (CRUD) (❗ R9 V5.8 升級 ❗)
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
            loadingMessage.style.display = 'none';
        } else {
            renderProductCards(products);
            loadingMessage.style.display = 'none';
        }
    }

    /**
     * (R8) 渲染 (Render)：
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
     * (C) 新增 (Create)：(❗❗ R9 V5.8 升級 ❗❗)
     */
    addForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        
        // (R9 V5.9 提醒：按鈕在 modal 內部，我們用 'submit' 事件)
        const submitButton = addForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = '上傳中...';

        let imageUrl = document.getElementById('product-image-url').value; 

        // ❗ R9 V5.8 邏輯：如果有檔案上傳，則優先處理檔案上傳
        const imageFile = productImageFile.files[0];
        if (imageFile) {
            imageUrl = await uploadImage(imageFile); 
            if (!imageUrl) {
                // 上傳失敗
                submitButton.disabled = false;
                submitButton.textContent = '新增商品';
                return; 
            }
        }
        
        const newProduct = {
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            price: parseInt(document.getElementById('product-price').value, 10),
            image_url: imageUrl, // ❗ R9 V5.8 修正
            quantity: parseInt(document.getElementById('product-quantity').value, 10)
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
            addImagePreview.innerHTML = '<p>無圖片預覽</p>'; // ❗ R9 V5.9 新增：清空預覽
            addModal.style.display = 'none';
            fetchProducts(); 
        }
        
        submitButton.disabled = false;
        submitButton.textContent = '新增商品';
    });

    /**
     * (U) 更新 (Update)：(❗❗ R9 V5.8 升級 ❗❗)
     */
    function openEditModal(product) {
        document.getElementById('edit-product-id').value = product.id; 
        document.getElementById('edit-product-name').value = product.name;
        document.getElementById('edit-product-description').value = product.description;
        document.getElementById('edit-product-price').value = product.price;
        document.getElementById('edit-product-image-url').value = product.image_url; // ❗ R9 V5.8 (保留)
        document.getElementById('edit-product-quantity').value = product.quantity;
        
        // ❗ R9 V5.9 新增：開啟時也顯示預覽
        editImagePreview.innerHTML = ''; // 清空舊預覽
        if (product.image_url) {
            const img = document.createElement('img');
            img.src = product.image_url;
            editImagePreview.appendChild(img);
        } else {
            editImagePreview.innerHTML = '<p>無圖片預覽</p>';
        }
        
        editProductImageFile.value = null; // ❗ R9 V5.9 新增：清空檔案選擇
        editModal.style.display = 'block';
    }
    
    editForm.addEventListener('submit', async function(event) {
        event.preventDefault(); 
        
        const submitButton = editForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = '上傳中...';
        
        let imageUrl = document.getElementById('edit-product-image-url').value; // 預設為舊的 URL

        // ❗ R9 V5.8 邏輯：如果 '更換' 了新檔案，才執行上傳
        const imageFile = editProductImageFile.files[0];
        if (imageFile) {
            imageUrl = await uploadImage(imageFile); // 呼叫上傳圖片函式
            if (!imageUrl) {
                // 上傳失敗
                submitButton.disabled = false;
                submitButton.textContent = '更新商品';
                return; 
            }
        }
        
        const productId = document.getElementById('edit-product-id').value; 
        const updatedProduct = {
            name: document.getElementById('edit-product-name').value,
            description: document.getElementById('edit-product-description').value,
            price: parseInt(document.getElementById('edit-product-price').value, 10),
            image_url: imageUrl, // ❗ R9 V5.8 修正
            quantity: parseInt(document.getElementById('edit-product-quantity').value, 10)
        };
        
        const { data, error } = await supabaseClient
            .from('products')
            .update({
                description: updatedProduct.description,
                price: updatedProduct.price,
                image_url: updatedProduct.image_url,
                quantity: updatedProduct.quantity 
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
        
        submitButton.disabled = false;
        submitButton.textContent = '更新商品';
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
    // 🔴 步驟六：Modal 控制邏輯 (維持不變)
    // -----------------------------------------------------------------

    openAddModalBtn.onclick = function() {
        addForm.reset(); 
        addImagePreview.innerHTML = '<p>無圖片預覽</p>'; // ❗ R9 V5.9 新增：清空預覽
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
    // 🔴 步驟七：啟動！
    // -----------------------------------------------------------------
    fetchProducts();
});