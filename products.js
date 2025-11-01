// R6 (Lesson 14.2): (修改 1)
// 1. 定義你的 API 網址 (GET 和 DELETE)
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('product-list-container');
    
    // 這是 V3.0.4 (Read) 的 API
    const GET_API_URL = "https://primary-production-76a77.up.railway.app/webhook/6f8b6916-7057-48a5-b163-18a08a82a59a";
    
    // 這是 V3.0.6 (Delete) 的 API 基礎網址
    // (來自你剛剛回報的 R1 導師的 URL)
    const DELETE_API_BASE_URL = "https://primary-production-76a77.up.railway.app/webhook/36626c26-29e6-49a2-a168-a5230f1333d6/product/"; // R6 提醒：注意結尾的 /


    // R6 (Lesson 14.2): (修改 2)
    // 2. 升級 createButton 函式，讓它能「真正」綁定點擊事件
    function createButton(text, className, onClickHandler) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = className;
        
        if (onClickHandler) {
            // R6: 如果有傳入 onClickHandler (例如刪除)，就綁定它
            button.addEventListener('click', onClickHandler); 
        } else {
            // R6: 如果沒有 (例如編輯)，就繼續用 alert 提示
            button.addEventListener('click', () => {
                 alert(`「${text}」功能尚未完成！`);
            });
        }
        return button;
    }

    // R6 (Lesson 14.2): (修改 3)
    // 3. 建立一個專門處理「刪除」的函式
    function handleDeleteClick(productId, productCardElement) {
        // R6: 友善提示：跟使用者做最後確認
        if (!confirm(`您確定要刪除這筆商品 (ID: ${productId}) 嗎？這無法復原！`)) {
            return; // R6: 如果使用者按了「取消」，就立刻停止
        }

        console.log(`(前端) 準備刪除 ID: ${productId}`);

        // R6 關鍵：組合出完整的 API 網址 (e.g. .../product/5)
        const deleteUrl = `${DELETE_API_BASE_URL}${productId}`;

        // R6 關鍵：使用 fetch() 呼叫 DELETE API
        fetch(deleteUrl, {
            method: 'DELETE' // R6: 告訴 API 我們要執行「刪除」
        })
        .then(response => {
            if (!response.ok) {
                // R7 偵錯：如果 API 回傳錯誤 (e.g. 500 Server Error)
                throw new Error(`API 刪除失敗，狀態碼：${response.status}`);
            }
            // R6: API 成功，解析 n8n 回傳的 JSON (e.g. [{"count":1}])
            return response.json(); 
        })
        .then(data => {
            console.log('(後端) 刪除成功:', data);
            
            // R6 關鍵：(前端) API 刪除成功後，也要把畫面上的卡片移除！
            productCardElement.remove();
            
            alert(`商品 (ID: ${productId}) 已成功刪除！`);
        })
        .catch(error => {
            // R7 偵錯：如果 fetch 本身失敗或 API 拋出錯誤
            console.error('刪除商品時發生錯誤:', error);
            alert(`刪除失敗：${error.message} (請檢查 n8n Executions)`);
        });
    }


    // --- (以下是 V3.0.4 (Read) 的程式碼，保持不變) ---
    
    fetch(GET_API_URL)
        .then(response => response.json())
        .then(products => {
            container.innerHTML = ''; 

            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product-card';
                // R6: 為卡片加上一個 data-* 屬性來儲存 ID (V3.0.6 會用到)
                productDiv.dataset.productId = product.id; 

                const productInfoDiv = document.createElement('div');
                productInfoDiv.className = 'product-info';

                const name = document.createElement('h3');
                name.textContent = product.name;
                name.dataset.field = 'name';

                const price = document.createElement('p');
                price.textContent = `價格: $${product.price}`;
                price.dataset.field = 'price'; 
                price.dataset.value = product.price;

                const description = document.createElement('p');
                description.textContent = product.description;
                description.dataset.field = 'description';

                const image = document.createElement('img');
                image.src = product.image_url;
                image.alt = product.name;
                image.className = 'product-card-image';
                image.dataset.field = 'image_url';

                // --- V3.0.6 (Delete) 修改點 ---
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'button-container'; 

                // R6: 「編輯」按鈕：保持不變 (繼續用 alert)
                const editButton = createButton('編輯', 'edit-button'); 
                
                // R6: 「刪除」按鈕：(關鍵修改！)
                // 我們(Gemini 團隊)傳入「刪除函式」，並告訴它「要刪哪個 ID」和「要移除哪張卡片」
                const deleteButton = createButton('刪除', 'delete-button', () => {
                    handleDeleteClick(product.id, productDiv); 
                });
                
                // --- V3.0.6 修改結束 ---


                // 把文字放進文字容器
                productInfoDiv.appendChild(name);
                productInfoDiv.appendChild(price);
                productInfoDiv.appendChild(description);

                // 把文字容器和圖片放進總卡片
                productDiv.appendChild(productInfoDiv); 
                productDiv.appendChild(image);          

                // 把按鈕容器也放進總卡片
                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(deleteButton);
                productDiv.appendChild(buttonContainer); 

                // 把這個 div 放進主容器
                container.appendChild(productDiv);
            });
        })
        .catch(error => { 
            console.error('讀取 API 失敗:', error);
            container.innerHTML = '<p>讀取商品失敗！請檢查 n8n API 是否 Active。</p>';
        });
});