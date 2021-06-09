const { Form, ErrorMessage, Field, defineRule, configure } = VeeValidate;
const { required, email, min, max, numeric } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

loadLocaleFromURL(
	// "https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json"
	"./zh_TW.json"
);

configure({
	// Generates an English message locale generator
	generateMessage: localize("zh_TW", {
		messages: {
			required: "為必填",
		},
	}),
});

defineRule("email", email);
defineRule("required", required);
defineRule("numeric", numeric);
defineRule("min", min);
defineRule("max", max);

const apiUrl = "https://vue3-course-api.hexschool.io";
const apiPath = "sec-hexschool";

const app = Vue.createApp({
	components: {
		VForm: VeeValidate.Form,
		VField: VeeValidate.Field,
		ErrorMessage: VeeValidate.ErrorMessage,
	},
	data() {
		return {
			product: [],
			tempProduct: {},
			cartList: [],
			loadingId: "",
			cartTotalPrice: 0,
			form: {},
		};
	},
	methods: {
		async getData(page = 1) {
			const url = `${apiUrl}/api/${apiPath}/products?page=${page}`;
			try {
				const resData = await axios.get(url);
				const { success, products, message } = resData.data;
				if (!success) throw new Error(message);
				this.product = products;
			} catch (error) {
				alert(error.message);
			}
		},
		async getCartList() {
			const url = `${apiUrl}/api/${apiPath}/cart`;
			try {
				const resData = await axios.get(url);
				const { success, message } = resData.data;
				if (!success) throw new Error(message);
				this.cartList = resData.data.data.carts;
				this.cartTotalPrice = this.cartList.reduce(
					(accum, val) => accum + val.total,
					0
				);
			} catch (error) {
				alert(error.message);
			}
		},
		async checkMoreDetails(product) {
			this.loadingId = product.id;
			this.tempProduct = product;
			await this.$refs.userProductModal.modalShow(product);
			this.loadingId = "";
		},
		async addToCart(product) {
			this.loadingId = product.id;
			const url = `${apiUrl}/api/${apiPath}/cart`;
			const obj = {
				data: {
					product_id: product.id,
					qty: product.qty,
				},
			};
			try {
				const resData = await axios.post(url, obj);
				const { message, success } = resData.data;
				this.loadingId = "";
				if (!success) throw new Error(message);
				alert(message);
				this.getCartList();
				this.$refs.userProductModal.modal.hide();
			} catch (error) {
				alert(error.message);
			}
		},
		async clearCartList() {
			const url = `${apiUrl}/api/${apiPath}/carts`;
			try {
				const resData = await axios.delete(url);
				const { message, success } = resData.data;
				if (!success) throw new Error(message);
				alert(message);
				this.getCartList();
			} catch (error) {
				alert(error.message);
			}
		},
		async removeSelectedItem(product) {
			this.loadingId = product.id;
			const url = `${apiUrl}/api/${apiPath}/cart/${product.id}`;
			try {
				const resData = await axios.delete(url);
				const { message, success } = resData.data;
				this.loadingId = "";
				if (!success) throw new Error(message);
				alert(message);
				this.getCartList();
			} catch (error) {
				alert(error.message);
			}
		},
		async updateCartItemQty(product, event) {
			const url = `${apiUrl}/api/${apiPath}/cart/${product.id}`;
			const obj = {
				data: {
					product_id: product.product_id,
					qty: +event.target.value,
				},
			};
			try {
				const resData = await axios.put(url, obj);
				this.getCartList();
				console.log(resData);
			} catch (error) {}
		},
		async submitForm() {
			// 出现问题!!
			console.log(this.form);
			const obj = { data: { user: { ...this.form } } };
			this.form = {};
			console.log(this.form);
			console.log(obj);
			// const url = `${apiUrl}/api/${apiPath}/order`;

			// try {
			// 	const resData = await axios.post(url, obj);
			// 	const { success, message } = resData.data;
			// 	if (!success) throw new Error(message);
			// 	console.log(this.form);
			// 	console.log(obj);
			// } catch (error) {
			// 	// alert(error.message);
			// }
		},
	},
	mounted() {
		this.getData();
		this.getCartList();
	},
});

app.component("userProductModal", {
	emits: ["addToCart"],
	template: "#userProductModal",
	data() {
		return {
			modal: "",
			modalCartQuantity: "",
			tempProduct: {},
		};
	},
	methods: {
		async modalShow(product) {
			const url = `${apiUrl}/api/${apiPath}/product/${product.id}`;
			try {
				const resData = await axios.get(url);
				if (!resData.data.success) {
					throw new Error(resData.data.message);
				}

				this.tempProduct = resData.data.product;
				this.modalCartQuantity = "";
				this.modal.show();
			} catch (error) {
				alert(error.message);
			}
		},
		modalAddToCart() {
			const product = {
				...this.tempProduct,
				qty: this.modalCartQuantity,
			};
			this.$emit("addToCart", product);
		},
	},
	mounted() {
		this.modal = new bootstrap.Modal(this.$refs.modal);
	},
});

app.mount("#app");
