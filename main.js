document.addEventListener("DOMContentLoaded", () => {
	// Hero texture — static grain + sparse stars, drawn once (no animation,
	// so this respects reduced-motion by simply never moving)
	const heroCanvas = document.getElementById("hero-texture");
	if (heroCanvas) {
		const dpr = window.devicePixelRatio || 1;
		const w = heroCanvas.parentElement.clientWidth;
		const h = heroCanvas.parentElement.clientHeight;
		heroCanvas.width = w * dpr;
		heroCanvas.height = h * dpr;
		heroCanvas.style.width = w + "px";
		heroCanvas.style.height = h + "px";
		const ctx = heroCanvas.getContext("2d");
		ctx.scale(dpr, dpr);

		// Grain
		const img = ctx.createImageData(w, h);
		for (let p = 0; p < img.data.length; p += 4) {
			const v = 200 + Math.random() * 55;
			img.data[p] = v;
			img.data[p + 1] = v;
			img.data[p + 2] = v;
			img.data[p + 3] = Math.random() * 12;
		}
		ctx.putImageData(img, 0, 0);

		// Sparse stars
		const starCount = Math.round((w * h) / 9000);
		for (let i = 0; i < starCount; i++) {
			const x = Math.random() * w;
			const y = Math.random() * h;
			const r = Math.random() * 0.9 + 0.2;
			const a = Math.random() * 0.5 + 0.15;
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(231,235,241,${a.toFixed(2)})`;
			ctx.fill();
		}
	}

	// Scroll reveal
	const targets = document.querySelectorAll(
		".skill-card, .project-card, .exp-entry, .volunteer-entry, .resume-block, .about-grid, .contact-wrap, .experience-timeline",
	);

	targets.forEach((el, i) => {
		el.classList.add("reveal");
		if (
			el.classList.contains("skill-card") ||
			el.classList.contains("project-card")
		) {
			const siblings = el.parentElement.querySelectorAll(
				".skill-card, .project-card",
			);
			siblings.forEach((card, idx) => {
				card.style.transitionDelay = `${idx * 0.08}s`;
			});
		}
	});

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
	);

	targets.forEach((el) => observer.observe(el));

	// Back to top button
	const backToTop = document.getElementById("back-to-top");
	if (backToTop) {
		window.addEventListener("scroll", () => {
			backToTop.classList.toggle("visible", window.scrollY > 300);
		});
		backToTop.addEventListener("click", () => {
			window.scrollTo({ top: 0, behavior: "smooth" });
		});
	}

	// Hamburger menu
	const hamburger = document.querySelector(".nav-hamburger");
	const navLinks = document.querySelector(".nav-links");
	if (hamburger) {
		hamburger.addEventListener("click", () => {
			hamburger.classList.toggle("open");
			navLinks.classList.toggle("open");
		});
		navLinks.querySelectorAll("a").forEach((link) => {
			link.addEventListener("click", () => {
				hamburger.classList.remove("open");
				navLinks.classList.remove("open");
			});
		});
	}

	// Page transitions
	document.querySelectorAll("a[href]").forEach((link) => {
		const href = link.getAttribute("href");
		if (
			href &&
			!href.startsWith("#") &&
			!href.startsWith("http") &&
			!href.startsWith("mailto")
		) {
			link.addEventListener("click", (e) => {
				e.preventDefault();
				document.body.classList.add("page-exit");
				setTimeout(() => {
					window.location.href = href;
				}, 250);
			});
		}
	});
});
