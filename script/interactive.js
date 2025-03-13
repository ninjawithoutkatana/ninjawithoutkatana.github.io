
window.onload = function () {

	let arr = [1, 2, 3, 4, 5];

	for (let i = 0; i < arr.length; i++) {
	let body = document.getElementById("card_" + arr[i])
	let referenceImage = document.getElementById("img_" + arr[i]);
	let canvas = document.createElement("canvas");
	canvas.width = referenceImage.offsetWidth
	canvas.height = referenceImage.offsetHeight
	let context = canvas.getContext('2d')
	context.drawImage(referenceImage, 0, 0);
	let randomX = Math.floor(Math.random() * (referenceImage.offsetWidth - 1) + 1)
	let randomY = Math.floor(Math.random() * (referenceImage.offsetHeight - 1) + 1)
	let color = context.getImageData(randomX, randomY, 1, 1).data
	body.style.backgroundColor = `rgb(${color[0]},${color[1]},${color[2]})`
	}
}