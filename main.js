// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2026-03-04
// @description  try to take over the world!
// @author       You
// @match        https://www.facebook.com/groups/*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

let isDoSomeThing = false;

async function sleep(duration) {
	return await new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
}

const days = ["hai", "ba", "tu", "nam", "sau", "bay", "chu nhat"];
const daysEng = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
];

function cv(str) {
	return str
		.normalize("NFD") // Tách dấu ra khỏi chữ cái (ví dụ: á -> a + ´)
		.replace(/[\u0300-\u036f]/g, "") // Xóa các ký tự dấu
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D") // Xử lý riêng chữ đ
		.toLowerCase()
		.trim();
}

function cvDayOfWeek(time) {
	time = cv(time);

	if (daysEng.includes(time)) {
		return daysEng.indexOf(time) + 1;
	}
	return days.indexOf(time) + 1;
}

function cvTimeToTimestamp(time, type) {
	const date = new Date();
	const currentDate = date.getDate();
	const minutes = date.getMinutes();
	const hours = date.getHours();
	const currentDayOfTheWeek = date.getDay();
	const day = cvDayOfWeek(time);
	const diff = currentDayOfTheWeek - day;
	const currentMonth = date.getMonth();

	switch (type) {
		case "m":
			return new Date(new Date().setMinutes(minutes - Number(time)));
		case "h":
			return new Date(new Date().setHours(hours - Number(time)));
		case "d":
			return new Date(new Date().setDate(currentDate - diff));
		case "w":
			if (time === "một" || time === "a" || time === "an") {
				time = 1 * 7;
			} else time = Number(time) * 7;
			return new Date(new Date().setDate(currentDate - time));
		case "mon":
			if (time === "một" || time === "a" || time === "an") {
				time = 1;
			} else time = Number(time);
			return new Date(new Date().setMonth(currentMonth - time));
		default:
			return new Date();
	}
}

function cvTimeToNumber(time) {
	if (!time) {
		return new Date().getTime();
	}

	time = time.toLowerCase();

	const ptNumber = new RegExp("\\d+", "i");
	const ptDayOfWeek = new RegExp(
		"\\bhai|ba|tư|năm|sáu|bảy|chủ nhật|monday|tuesday|wednesday|thursday|friday|saturday|sunday\\b",
		"i",
	);
	const ptWeekOrMonth = new RegExp(
		"\\bmột|hai|ba|bốn|năm|sáu|bảy|tám|chín|a|an\\b",
	);

	let newTime = ptNumber.exec(time);
	let type = null;

	if (
		(time.includes("thứ") && time.includes("tuần")) ||
		(time.includes("last") && ptDayOfWeek.exec(time))
	) {
		newTime = ["một"];
		type = "w";
	} else if (
		time.includes("phút") ||
		time.includes("minute") ||
		time.includes("minutes")
	) {
		type = "m";
	} else if (
		time.includes("giờ") ||
		time.includes("hour") ||
		time.includes("hours")
	) {
		type = "h";
	} else if (
		time.includes("thứ") ||
		time.includes("Thứ") ||
		ptDayOfWeek.exec(time)
	) {
		type = "d";
		newTime = ptDayOfWeek.exec(time);
	} else if (
		time.includes("tuần") ||
		time.includes("week") ||
		time.includes("weeks")
	) {
		type = "w";
		newTime = ptWeekOrMonth.exec(time);
	} else if (
		time.includes("tháng") ||
		time.includes("month") ||
		time.includes("months")
	) {
		type = "mon";
		newTime = ptWeekOrMonth.exec(time);
	} else {
		console.log("its is unknown or u never posted here");
	}
	if (newTime) {
		return { time: newTime?.[0], type };
	}
	return { time: "0", type };
}

function getListTitle(value) {
	if (!value || !value.trim()) return [];

	return value
		.trim()
		.split(",")
		.map((val) => val.trim());
}

async function scroll(el) {
	let i = 0;
	const duration = 2000;
	while (i < 1000) {
		const height = el.scrollHeight;
		const prevLength = el.firstChild.childNodes.length;
		el.scrollTo({
			behavior: "smooth",
			top: height,
		});
		await sleep(duration);
		const newLength = el.firstChild.childNodes.length;
		//console.log("prev: " + prevLength + ", new: " + newLength);
		if (prevLength == newLength) {
			const childs = el.firstChild.childNodes;
			//console.log(childs);
			break;
		}
		++i;
	}
}

function drawDivContainer() {
	const divContainer = document.createElement("div");
	divContainer.style.position = "fixed";
	divContainer.style.right = "20px";
	divContainer.style.top = "60px";
	divContainer.style.zIndex = 100000;
	divContainer.style.display = "flex";
	divContainer.style.padding = "8px";
	divContainer.style.backgroundColor = "white";
	divContainer.style.borderRadius = "4px";
	divContainer.style.flexDirection = "column";
	divContainer.style.minWidth = "250px";

	const innerDiv = document.createElement("div");
	innerDiv.style.display = "flex";
	innerDiv.style.flexDirection = "column";
	innerDiv.style.position = "relative";

	return { divContainer, innerDiv };
}

function drawField(el) {
	const divFieldTitle = document.createElement("div");
	divFieldTitle.style.margin = "8px 0";
	divFieldTitle.style.display = "flex";
	divFieldTitle.style.flexDirection = "column";

	const inputTitle = document.createElement("input");
	inputTitle.type = "text";
	inputTitle.placeholder = "Enter title";
	inputTitle.style.padding = "8px";
	inputTitle.style.border = "1px solid #ddd";
	inputTitle.style.borderRadius = "4px";
	inputTitle.setAttribute("id", "input-title");

	const labelTitle = document.createElement("label");
	labelTitle.innerText = `Enter title (Seperate by comma ",")`;
	labelTitle.style.marginBottom = "4px";
	labelTitle.style.fontSize = "12px";
	labelTitle.setAttribute("for", "input-title");

	const divFieldDetectTime = document.createElement("div");
	divFieldDetectTime.style.display = "flex";
	divFieldDetectTime.style.alignItems = "center";
	divFieldDetectTime.style.margin = "8px 0";

	const inputDetectTime = document.createElement("input");
	inputDetectTime.type = "checkbox";
	inputDetectTime.style.width = "16px";
	inputDetectTime.style.height = "16px";
	inputDetectTime.setAttribute("id", "input-detect-time");

	const labelDetectTime = document.createElement("label");
	labelDetectTime.innerText = "Detect time (select item oldest)";
	labelDetectTime.style.marginLeft = "4px";
	labelDetectTime.setAttribute("for", "input-detect-time");

	const divFieldAutoPost = document.createElement("div");
	divFieldAutoPost.style.display = "flex";
	divFieldAutoPost.style.alignItems = "center";
	divFieldAutoPost.style.margin = "8px 0";

	const inputAutoPost = document.createElement("input");
	inputAutoPost.type = "checkbox";
	inputAutoPost.style.width = "16px";
	inputAutoPost.style.height = "16px";
	inputAutoPost.setAttribute("id", "input-auto-post");
	inputAutoPost.checked = true;

	const labelAutoPost = document.createElement("label");
	labelAutoPost.innerText = "Auto post";
	labelAutoPost.style.marginLeft = "4px";
	labelAutoPost.setAttribute("for", "input-auto-post");

	divFieldTitle.appendChild(labelTitle);
	divFieldTitle.appendChild(inputTitle);

	divFieldDetectTime.appendChild(inputDetectTime);
	divFieldDetectTime.appendChild(labelDetectTime);
	divFieldAutoPost.appendChild(inputAutoPost);
	divFieldAutoPost.appendChild(labelAutoPost);

	el.appendChild(divFieldTitle);
	el.appendChild(divFieldDetectTime);
	el.appendChild(divFieldAutoPost);

	return {
		getTitle: () => inputTitle.value,
		getIsDetectTime: () => inputDetectTime.checked,
		getIsAutoPost: () => inputAutoPost.checked,
	};
}

function drawBtn(el) {
	const divBtn = document.createElement("div");
	divBtn.style.display = "flex";
	divBtn.style.justifyContent = "flex-end";
	divBtn.style.marginTop = "8px";
	divBtn.style.gap = "8px";

	const btnScroll = document.createElement("button");
	btnScroll.innerText = "Scroll";
	btnScroll.style.padding = "8px";
	btnScroll.style.cursor = "pointer";

	const btnScrollAndPick = document.createElement("button");
	btnScrollAndPick.innerText = "Scroll and Pick";
	btnScrollAndPick.style.padding = "8px";
	btnScrollAndPick.style.cursor = "pointer";
	btnScrollAndPick.style.marginLeft = "8px";

	const btnAutoAll = document.createElement("button");
	btnAutoAll.innerText = "Auto All";
	btnAutoAll.style.padding = "8px";
	btnAutoAll.style.cursor = "pointer";

	divBtn.appendChild(btnAutoAll);
	divBtn.appendChild(btnScrollAndPick);
	divBtn.appendChild(btnScroll);
	el.appendChild(divBtn);

	function disableBtn() {
		btnScroll.setAttribute("disabled", true);
		btnAutoAll.setAttribute("disabled", true);
		btnScrollAndPick.setAttribute("disabled", true);
		btnScroll.style.cursor = "not-allowed";
		btnAutoAll.style.cursor = "not-allowed";
		btnScrollAndPick.style.cursor = "not-allowed";
	}

	function enableBtn() {
		btnScroll.removeAttribute("disabled");
		btnAutoAll.removeAttribute("disabled");
		btnScrollAndPick.removeAttribute("disabled");
		btnScroll.style.cursor = "pointer";
		btnAutoAll.style.cursor = "pointer";
		btnScrollAndPick.style.cursor = "pointer";
	}

	return {
		btnScroll,
		btnScrollAndPick,
		btnAutoAll,
		disableBtn,
		enableBtn,
	};
}

function drawCloseAndShow(el) {
	const spanClose = document.createElement("span");
	spanClose.innerText = "×";
	spanClose.style.position = "absolute";
	spanClose.style.top = "0px";
	spanClose.style.right = "4px";
	spanClose.style.cursor = "pointer";
	spanClose.style.fontSize = "16px";
	spanClose.style.fontWeight = "bold";
	spanClose.setAttribute("title", "Hide");

	const spanOpen = document.createElement("span");
	spanOpen.innerText = "Show";
	spanOpen.style.position = "fixed";
	spanOpen.style.top = "60px";
	spanOpen.style.right = "20px";
	spanOpen.style.padding = "8px";
	spanOpen.style.backgroundColor = "white";
	spanOpen.style.borderRadius = "4px";
	spanOpen.style.cursor = "pointer";
	spanOpen.style.zIndex = 100000;
	spanOpen.style.display = "none";

	el.appendChild(spanClose);
	document.body.appendChild(spanOpen);

	return {
		spanClose,
		spanOpen,
	};
}

function drawError(el) {
	const divError = document.createElement("div");
	divError.style.color = "red";
	divError.style.display = "none";

	const pError = document.createElement("p");
	pError.innerText = "Error: Please enter a title.";

	divError.appendChild(pError);

	function showError(message) {
		pError.innerText = `Error: ${message}`;
		divError.style.display = "block";
	}

	function clearError() {
		pError.innerText = "";
		divError.style.display = "none";
	}

	el.appendChild(divError);

	return {
		pError,
		showError,
		clearError,
	};
}

function drawMessage() {
	const pMessage = document.createElement("p");
	pMessage.innerText = "";
	pMessage.style.display = "none";

	function showMessage(msg) {
		pMessage.innerText = msg;
		pMessage.style.display = "block";
	}

	function hideMessage(msg) {
		pMessage.style.display = "none";
	}

	return {
		showMessage,
		hideMessage,
		pMessage,
	};
}

function getDivAddGroups() {
	let div = document.querySelector(
		`div[aria-label="Thêm nhóm"][role="dialog"]`,
	);
	if (!div) {
		div = document.querySelector(`div[aria-label="Add groups"][role="dialog"]`);
	}

	return div;
}

function getDivButtonDone() {
	let div = document.querySelector(`div[aria-label="Xong"][role="button"]`);
	if (!div) {
		div = document.querySelector(`div[aria-label="Done"][role="button"]`);
	}

	return div;
}

function clickButtonDone() {
	const div = getDivButtonDone();
	if (div) {
		div.click();
	}
}

function getDivButtonPost() {
	//do some thing...
}

function clickButtonPost() {
	//do some thing...
}

(async function () {
	"use strict";

	// Your code here...
	console.log("Script is running");

	// await sleep(4000);

	//draw element here

	const { divContainer, innerDiv } = drawDivContainer();

	const { spanClose, spanOpen } = drawCloseAndShow(innerDiv);

	function hideTool() {
		divContainer.style.display = "none";
		divContainer.style.pointerEvents = "none";
		spanOpen.style.display = "block";
		spanOpen.style.pointerEvents = "auto";
	}

	function showTool() {
		divContainer.style.display = "flex";
		divContainer.style.pointerEvents = "auto";
		spanOpen.style.display = "none";
		spanOpen.style.pointerEvents = "none";
	}

	// hide();

	spanOpen.addEventListener("click", () => {
		showTool();
	});

	spanClose.addEventListener("click", () => {
		hideTool();
	});

	const fields = drawField(innerDiv);

	const { pMessage, showMessage, hideMessage } = drawMessage();
	innerDiv.appendChild(pMessage);
	const { clearError, pError, showError } = drawError(innerDiv);
	clearError();

	const { btnScroll, btnScrollAndPick, btnAutoAll, disableBtn, enableBtn } =
		drawBtn(innerDiv);
	divContainer.appendChild(innerDiv);

	//end draw element

	//btn auto all event
	btnAutoAll.addEventListener("click", () => {
		const divButtonDone = getDivButtonDone();
		divButtonDone.click();
	});

	//btn scroll event
	btnScroll.addEventListener("click", async () => {
		clearError();
		const div = getDivAddGroups();
		const parent = div?.parentElement;
		const el = parent?.children[1].children[1];
		if (el) {
			showMessage("Scrolling...");
			disableBtn();
			await scroll(el);
			hideMessage();
			enableBtn();
		}
	});

	//btn scroll and pick event
	btnScrollAndPick.addEventListener("click", async () => {
		clearError();
		disableBtn();

		const div = getDivAddGroups();

		if (div) {
			const parent = div.parentElement;
			const el = parent?.children[1].children[1];
			if (el) {
				const valueTitle = fields.getTitle();
				const listTitle = getListTitle(valueTitle);

				if (!valueTitle || !valueTitle.trim()) {
					showError("Please enter title");
					enableBtn();
					return;
				}

				showMessage("Scrolling and picking...");

				await scroll(el);

				const childs = el.firstChild.childNodes;
				const newChilds = [];
				childs.forEach((val, key) => {
					if (key > 0 && key < childs.length - 3) {
						newChilds.push(val);
					}
				});

				const data = [];
				for await (const item of newChilds) {
					const spans = item.querySelectorAll("span");
					const title = spans?.[0].innerText;
					const timeOrNot = spans?.[1].innerText;

					const newConvertTitle = cv(title);
					for (const title of listTitle) {
						const newConvertValueTitle = cv(title);
						if (newConvertTitle.includes(newConvertValueTitle)) {
							const obj = cvTimeToNumber(timeOrNot);
							data.push({
								item,
								time: cvTimeToTimestamp(obj.time, obj.type).getTime(),
							});
						}
					}
				}

				const isDetectTime = fields.getIsDetectTime();
				if (isDetectTime) {
					data.sort((a, b) => (a.time > b.time ? 1 : -1));
				}

				let i = 0; //number of groups (max is 9 + current group)
				for await (const obj of data) {
					const item = obj.item;
					const inputCheckbox = item.querySelector(`input[type="checkbox"]`);

					if (inputCheckbox && i < 9) {
						item.scrollIntoView({
							behavior: "smooth",
							block: "nearest",
						});
						await sleep(2000);

						//check input simulator
						const parent = inputCheckbox.parentElement;
						if (parent) {
							parent.click();
							++i;
						}
						await sleep(1000);
					}
				}
				if (i >= 9) {
					await sleep(2000);
					clickButtonDone();
				}
				hideMessage();
				console.log("DONE");
			}
		}
		enableBtn();
	});
	console.log("end user-script");

	document.body.appendChild(divContainer);
})();
