const api_path = "xianbei";
const token = {
	headers: {
		Authorization: "lBGSr6cAu3RK0JllUj1XD5E8T1S2",
	},
};

function init() {
	getProducts();
	getCartData();
}
init();

//取得產品資料
let productData = [];
function getProducts() {
	axios
		.get(
			`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
		)
		.then((res) => {
			productData = res.data.products;
			renderProducts(productData);
		})
		.catch((err) => {
			console.error(err);
		});
}

//渲染所有產品
const productWrap = document.querySelector(".productWrap");
function renderProducts(data) {
	let str = "";
	data.forEach((item) => {
		str += `
            <li class="productCard">
                <h4 class="productType">新品</h4>
                <img
                    src="${item.images}"
                    alt=""
                />
                <a href="" class="addCardBtn" data-id="${item.id}">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${item.origin_price}</del>
                <p class="nowPrice">NT$${item.price}</p>
			</li>
            `;
	});
	productWrap.innerHTML = str;
}

//取得購物車資料
let cartData = [];
function getCartData() {
	axios
		.get(
			`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
		)
		.then((res) => {
			cartData = res.data;
			renderCart(cartData);
		})
		.catch((err) => {
			console.log(err);
		});
}

//渲染購物車
const shoppingCartTable = document.querySelector(".shoppingCart-table");
function renderCart(data) {
	//表頭
	let str = `
    <tr>
        <th width="40%">品項</th>
        <th width="15%">單價</th>
        <th width="15%">數量</th>
        <th width="15%">金額</th>
        <th width="15%"></th>
	</tr>
    `;
	//表內容
	data.carts.forEach((item) => {
		str += `
        <tr>
            <td>
                <div class="cardItem-title">
                    <img
                        src="${item.product.images}"
                        alt=""
                    />
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${item.product.price}</td>
            <td>${item.quantity}</td>
            <td>NT$${item.product.price * item.quantity}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${
					item.id
				}"> clear </a>
            </td>
        </tr>
      `;
	});
	//表尾
	//若購物車中沒有商品，拿掉刪除全部商品按鈕
	if (data.carts.length == 0) {
		str += `
        <tr>
            <td>
                
            </td>
            <td></td>
            <td></td>
            <td>
                <p>總金額</p>
            </td>
            <td>NT$${data.finalTotal}</td>
        </tr>
        `;
	} else {
		str += `
        <tr>
            <td>
                <a href="#" class="discardAllBtn">刪除所有品項</a>
            </td>
            <td></td>
            <td></td>
            <td>
                <p>總金額</p>
            </td>
            <td>NT$${data.finalTotal}</td>
        </tr>
        `;
	}
	shoppingCartTable.innerHTML = str;
}

//加入購物車
productWrap.addEventListener("click", function (e) {
	//中斷預設功能
	e.preventDefault();
	let productId;
	let quantity = 0;
	if (e.target.getAttribute("class") === "addCardBtn") {
		productId = e.target.dataset.id;
		//比對是否在購物車中已有產品。注意，購物車中的產品ID是item.product.id
		//若購物車中有該產品，將該產品的數量紀錄
		cartData.carts.forEach((item) => {
			if (item.product.id == productId) {
				quantity = item.quantity;
			}
		});
		let data = {
			data: {
				productId,
				//若購物車中已有產品，產品數量加一。
				quantity: quantity + 1,
			},
		};
		axios
			.post(
				`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
				data
			)
			.then((res) => {
				cartData = res.data;
				renderCart(cartData);
				//用sweetalert提醒
				Swal.fire({
					icon: "success",
					title: "商品加入購物車成功",
				});
			})
			.catch((error) => {
				console.log(error);
			});
	}
});

//刪除購物車中產品
shoppingCartTable.addEventListener("click", (e) => {
	e.preventDefault();
	let cartId;
	//刪除所有產品
	if (e.target.getAttribute("class") == "discardAllBtn") {
		axios
			.delete(
				`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
			)
			.then((res) => {
				cartData = res.data;
				renderCart(cartData);
				Swal.fire({
					icon: "success",
					title: "已刪除購物車中所有商品",
				});
			})
			.catch((error) => {
				console.log(error);
			});
	}
	//刪除選取商品
	if (e.target.getAttribute("class") == "material-icons") {
		cartId = e.target.dataset.id;
		axios
			.delete(
				`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
			)
			.then((res) => {
				Swal.fire({
					icon: "success",
					title: "商品刪除成功",
				});
				cartData = res.data;
				renderCart(cartData);
			})
			.catch((error) => {
				console.log(error);
			});
	}
});

//送出顧客訂單
const orderInfoForm = document.querySelector(".orderInfo-form");
const customerName = document.getElementById("customerName");
const customerPhone = document.getElementById("customerPhone");
const customerEmail = document.getElementById("customerEmail");
const customerAddress = document.getElementById("customerAddress");
const tradeWay = document.getElementById("tradeWay");
const orderInfoBtn = document.querySelector(".orderInfo-btn");

orderInfoBtn.addEventListener("click", (e) => {
	e.preventDefault();
	//驗證輸入內容
	if (customerName.value.trim().length == 0) {
		Swal.fire({
			icon: "warning",
			title: "姓名必填",
		});
		return;
	}
	let name = customerName.value;
	if (customerPhone.value.trim().length == 0) {
		Swal.fire({
			icon: "warning",
			title: "電話必填",
		});
		return;
	}
	let tel = customerPhone.value;
	if (customerEmail.value.trim().length == 0) {
		Swal.fire({
			icon: "warning",
			title: "Email必填",
		});
		return;
	}
	let email = customerEmail.value;
	if (customerAddress.value.trim().length == 0) {
		Swal.fire({
			icon: "warning",
			title: "地址必填",
		});
		return;
	}
	let address = customerAddress.value;
	let payment = tradeWay.value;
	//組裝輸入資料
	let data = {
		data: {
			user: {
				name,
				tel,
				email,
				address,
				payment,
			},
		},
	};
	axios
		.post(
			`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
			data
		)
		.then((res) => {
			Swal.fire({
				icon: "success",
				title: "送出訂單成功",
			});
			orderInfoForm.reset();
			getCartData();
		})
		.catch((err) => {
			console.error(err);
		});
});
