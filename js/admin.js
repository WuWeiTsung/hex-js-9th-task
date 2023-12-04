const api_path = "xianbei";
const token = {
	headers: {
		Authorization: "lBGSr6cAu3RK0JllUj1XD5E8T1S2",
	},
};

function init() {
	getOrders();
}
init();

//取得訂單資料
const discardAllBtn = document.querySelector(".discardAllBtn");
let orderData = [];
function getOrders() {
	axios
		.get(
			`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
			token
		)
		.then((res) => {
			orderData = res.data.orders;
			//若沒有訂單資料，隱藏清除全部訂單按鈕
			if (orderData.length == 0) {
				discardAllBtn.style.display = "none";
			}
			renderOrders(orderData);
			renderC3(orderData);
		})
		.catch((err) => {
			console.log(err);
		});
}

//渲染訂單畫面
const orderPageTable = document.querySelector(".orderPage-table");
function renderOrders(data) {
	let str = `
        <thead>
            <tr>
                <th>訂單編號</th>
                <th>聯絡人</th>
                <th>聯絡地址</th>
                <th>電子郵件</th>
                <th>訂單品項</th>
                <th>訂單日期</th>
                <th>訂單狀態</th>
                <th>操作</th>
            </tr>
        </thead>
    `;

	data.forEach((item) => {
		str += `
            <tr>
                <td>${item.createdAt}</td>
                <td>
                    <p>${item.user.name}</p>
                    <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>
                    <p>${item.products
						.map((item2) => `${item2.title} * ${item2.quantity}`)
						.join("<br/>")}</p>
                </td>
                <td>${new Date(item.createdAt * 1000).getFullYear()}/${
			new Date(item.createdAt * 1000).getMonth() + 1
		}/${new Date(item.createdAt * 1000).getDate()}</td>
                <td class="orderStatus" data-id="${item.id}">
                ${
					item.paid
						? `<a href="#" class="paid" data-id="${item.id}">已處理</a>`
						: `<a href="#" class="unpaid" data-id="${item.id}">未處理</a>`
				}                   
                </td>
                <td>
                    <input type="button" class="delSingleOrder-Btn" value="刪除" data-id="${
						item.id
					}">
                </td>
            </tr>
        `;
	});
	orderPageTable.innerHTML = str;
}

//修改訂單狀態
orderPageTable.addEventListener("click", (e) => {
	e.preventDefault();
	let id;
	let data = {};
	//修改訂單，判斷目前狀態，組出資料
	if (e.target.getAttribute("class") == "unpaid") {
		id = e.target.dataset.id;
		data = {
			data: {
				id,
				paid: true,
			},
		};
	} else if (e.target.getAttribute("class") == "paid") {
		id = e.target.dataset.id;
		data = {
			data: {
				id,
				paid: false,
			},
		};
	} else {
		return;
	}
	axios
		.put(
			`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
			data,
			token
		)
		.then((res) => {
			orderData = res.data.orders;
			Swal.fire({
				icon: "success",
				title: "訂單狀態修改成功",
			});
			renderOrders(orderData);
		})
		.catch((err) => {
			coneole.error(err);
		});
});

//刪除訂單
orderPageTable.addEventListener("click", (e) => {
	e.preventDefault();
	if (e.target.getAttribute("class") == "delSingleOrder-Btn") {
		let id = e.target.dataset.id;
		axios
			.delete(
				`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
				token
			)
			.then((res) => {
				orderData = res.data.orders;
				if (orderData.length == 0) {
					discardAllBtn.style.display = "none";
				}
				Swal.fire({
					icon: "success",
					title: "訂單刪除成功",
				});
				renderOrders(orderData);
				renderC3(orderData);
			})
			.catch((err) => {
				console.log(err);
			});
	} else {
		return;
	}
});
//刪除全部訂單
discardAllBtn.addEventListener("click", (e) => {
	e.preventDefault();
	axios
		.delete(
			`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`,
			token
		)
		.then((res) => {
			orderData = res.data.orders;
			if (orderData.length == 0) {
				discardAllBtn.style.display = "none";
			}
			Swal.fire({
				icon: "success",
				title: "刪除全部訂單成功",
			});
			renderOrders(orderData);
			renderC3(orderData);
		})
		.catch((err) => {
			console.log(err);
		});
});

//C3圖表資料

function renderC3(data) {
	let obj = {};
	let rawData = [];
	let chartData = [];
	data.forEach((item) => {
		item.products.forEach((item2) => {
			if (obj[item2.title] == undefined) {
				obj[item2.title] = item2.quantity;
			} else {
				obj[item2.title] += item2.quantity;
			}
		});
	});
	let name = Object.keys(obj);
	name.forEach((item) => {
		let arr = [];
		arr.push(item);
		arr.push(obj[item]);
		rawData.push(arr);
	});
	//排序，用rawData中產品數量來排序
	rawData.sort(function (a, b) {
		//b-a是由大到小排列，[1]代表用陣列的第二個數來比較大小來排列
		return b[1] - a[1];
	});
	//排出前三名，組出圖表columns內容
	for (let i = 0; i < 3; i++) {
		chartData.push(rawData[i]);
	}
	//計算其他
	let otherNum = 0;
	for (let i = 3; i < rawData.length; i++) {
		otherNum += rawData[i][1];
	}
	chartData.push(["其他", otherNum]);
	//組出color陣列內容
	let color = {};
	color[chartData[0][0]] = "#DACBFF";
	color[chartData[1][0]] = "#9D7FEA";
	color[chartData[2][0]] = "#5434A7";
	color["其他"] = "#301E5F";
	//C3.js
	let chart = c3.generate({
		bindto: "#chart", // HTML 元素綁定
		data: {
			type: "pie",
			columns: chartData,
			colors: color,
		},
	});
}

