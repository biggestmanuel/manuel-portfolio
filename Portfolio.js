const photo = document.querySelector(".photo-3d");
const container = document.querySelector(".photo-container");

container.addEventListener("mousemove", function (e) {
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  const rotateX = -(y / rect.height) * 20;
  const rotateY = (x / rect.width) * 20;
  photo.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  photo.style.boxShadow = `0 30px 80px rgba(26, 115, 232, 0.5)`;
});

container.addEventListener("mouseleave", function () {
  photo.style.transform = "";
  photo.style.boxShadow = "";
});