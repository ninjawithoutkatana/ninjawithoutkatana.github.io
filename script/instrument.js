const instruments = document.querySelectorAll(".instrument_case");

const openInstruments = (instrument) => {
	const content = instrument.querySelector(".instrument_page");
	instrument.classList.add("instrument_case_active");
	content.style.maxHeight = content.scrollHeight + "px";
};

const closeInstruments = (instrument) => {
	const content = instrument.querySelector(".instrument_page");
	instrument.classList.remove("instrument_case_active");
	content.style.maxHeight = null;
};

instruments.forEach((instrument) => {
	const intro = instrument.querySelector(".instrument_intro");
	const content = instrument.querySelector(".instrument_page");

	intro.onclick = () => {
		if (content.style.maxHeight) {
			closeInstruments(instrument);
		} else {
			instruments.forEach((instrument) => closeInstruments(instrument));
			openInstruments(instrument);
		}
	};
});