let question = document.querySelectorAll(".question");

question.forEach((qsitem) => {
	qsitem.addEventListener("click", function (e) {
		let sibling = qsitem.nextElementSibling;

		question.forEach((item) => {
			item.nextElementSibling.style.height = "0px";
			item != qsitem && item.parentNode.classList.remove("active");
		});
		this.parentNode.classList.toggle("active");

		if (qsitem.parentNode.classList.contains("active")) {
			sibling.style.height = sibling.scrollHeight + "px";
		} else {
			sibling.style.height = "0px";
		}
	});
});