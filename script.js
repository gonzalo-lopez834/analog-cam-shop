document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.querySelector(".productos");
  let productosGlobal = []; // guardará el array de productos traído por fetch
  let carrito = []; // nuestro carrito inicial

  // Intentar recuperar el carrito guardado en localStorage
  const carritoGuardado = localStorage.getItem("carrito");
  if (carritoGuardado) {
    carrito = JSON.parse(carritoGuardado); // lo convertimos de texto a array JS
  }

  // Traer los productos
  fetch("productos.json")
    .then(res => res.json())
    .then(productos => {
      productosGlobal = productos; // guardamos la referencia para luego buscar por ID
      renderProductos(productos);
    })
    .catch(error => {
      console.error("Error al cargar productos:", error);
      contenedor.innerHTML = "<p>No se pudieron cargar los productos</p>";
    });

  function renderProductos(productos) {
    contenedor.innerHTML = "";
    productos.forEach(p => {
      const div = document.createElement("div");
      div.classList.add("card");
      div.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}" />
        <p><strong>${p.nombre}</strong><br />$${p.precio.toLocaleString()} ARS</p>
        <button class="btn-agregar" data-id="${p.id}">Agregar al carrito</button>
        <div class="mensaje-agregado" style="display:none;opacity:0;transition:opacity 0.5s;"></div>
      `;
      contenedor.appendChild(div);
    });
    agregarListeners();
  }

  function agregarListeners() {
    const botones = document.querySelectorAll(".btn-agregar");
    botones.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);

        // Buscamos el producto original por ID
        const productoSeleccionado = productosGlobal.find(p => p.id === id);
        if (!productoSeleccionado) return;

        // ¿Ya está en el carrito? Sumamos cantidad. Si no, lo agregamos.
        const productoEnCarrito = carrito.find(p => p.id === id);
        if (productoEnCarrito) {
          productoEnCarrito.cantidad += 1;
        } else {
          carrito.push({ ...productoSeleccionado, cantidad: 1 });
        }

        // Guardamos en localStorage
        localStorage.setItem("carrito", JSON.stringify(carrito));
        console.log("Carrito actualizado:", carrito);
        renderVistaCarrito();

        // Mostrar mensaje de éxito debajo del botón
        const mensajeDiv = btn.parentElement.querySelector('.mensaje-agregado');
        if (mensajeDiv) {
          mensajeDiv.textContent = '¡Producto agregado al carrito!';
          mensajeDiv.style.display = 'block';
          mensajeDiv.style.opacity = '1';
          mensajeDiv.style.color = '#388e3c';
          mensajeDiv.style.background = '#e8f5e9';
          mensajeDiv.style.padding = '0.5em';
          mensajeDiv.style.marginTop = '0.5em';
          mensajeDiv.style.borderRadius = '6px';
          // Ocultar suavemente
          setTimeout(() => {
            mensajeDiv.style.opacity = '0';
            setTimeout(() => {
              mensajeDiv.style.display = 'none';
            }, 500);
          }, 2000);
        }
      });
    });
  }

  // Mostrar/Ocultar vista carrito y navegación entre secciones
  function mostrarSeccion(id) {
    if (id === 'inicio') {
      document.querySelectorAll('main > section').forEach(sec => {
        if (sec.id !== 'vista-carrito') {
          sec.classList.remove('hidden');
          sec.style.display = 'block';
          void sec.offsetWidth;
          sec.style.opacity = '1';
        } else {
          sec.style.opacity = '0';
          setTimeout(() => {
            sec.style.display = 'none';
            sec.classList.add('hidden');
          }, 500);
        }
      });
    } else {
      document.querySelectorAll('main > section').forEach(sec => {
        if (sec.id === id) {
          sec.classList.remove('hidden');
          sec.style.display = 'block';
          void sec.offsetWidth;
          sec.style.opacity = '1';
        } else {
          sec.style.opacity = '0';
          setTimeout(() => {
            sec.style.display = 'none';
            sec.classList.add('hidden');
          }, 500);
        }
      });
    }
    if (id === 'vista-carrito') renderVistaCarrito();
  }

  // Navbar: navegación entre secciones
  document.querySelectorAll('.header__linklist-link').forEach(link => {
    link.addEventListener('click', e => {
      const hash = link.getAttribute('href');
      if (hash && hash.startsWith('#')) {
        e.preventDefault();
        const id = hash.replace('#', '');
        mostrarSeccion(id);
        // Si es inicio, mostrar todas las secciones menos el carrito
        if (id === 'inicio') {
          document.querySelectorAll('main > section').forEach(sec => {
            if (sec.id !== 'vista-carrito') {
              sec.classList.remove('hidden');
            } else {
              sec.classList.add('hidden');
            }
          });
        }
      }
    });
  });

  const vistaCarrito = document.querySelector("#vista-carrito");
  const btnCarrito = document.querySelector("[aria-label='Carrito']");
  const itemsCarrito = document.querySelector("#items-carrito");
  const totalCarrito = document.querySelector("#total-carrito");
  const contadorCarrito = document.querySelector("#contador-carrito");

  btnCarrito.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarSeccion('vista-carrito');
  });

  function renderVistaCarrito() {
    itemsCarrito.innerHTML = "";
    // Eliminar botón vaciar carrito previo si existe
    const btnPrevio = vistaCarrito.querySelector('.btn-vaciar-carrito');
    if (btnPrevio) btnPrevio.remove();

    if (carrito.length === 0) {
      itemsCarrito.innerHTML = "<p>Tu carrito está vacío</p>";
      totalCarrito.textContent = "";
      contadorCarrito.textContent = 0;
      return;
    }

    carrito.forEach((item, index) => {
      const div = document.createElement("div");
      div.classList.add("card");
      div.innerHTML = `
        <img src="${item.imagen}" alt="${item.nombre}" />
        <p><strong>${item.nombre}</strong></p>
        <p>$${item.precio.toLocaleString()} x ${item.cantidad} = <strong>$${(item.precio * item.cantidad).toLocaleString()}</strong></p>
        <div>
          <button class="btn-menos" data-index="${index}">–</button>
          <button class="btn-mas" data-index="${index}">+</button>
          <button class="btn-borrar" data-index="${index}">🗑️</button>
        </div>
      `;
      itemsCarrito.appendChild(div);
    });

    const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
    totalCarrito.textContent = `Total: $${total.toLocaleString()} ARS`;
    contadorCarrito.textContent = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // Agregar listeners a botones
    document.querySelectorAll(".btn-mas").forEach(btn =>
      btn.addEventListener("click", () => {
        carrito[btn.dataset.index].cantidad++;
        renderVistaCarrito();
      })
    );

    document.querySelectorAll(".btn-menos").forEach(btn =>
      btn.addEventListener("click", () => {
        const i = btn.dataset.index;
        carrito[i].cantidad = Math.max(1, carrito[i].cantidad - 1);
        renderVistaCarrito();
      })
    );

    document.querySelectorAll(".btn-borrar").forEach(btn =>
      btn.addEventListener("click", () => {
        carrito.splice(btn.dataset.index, 1);
        renderVistaCarrito();
      })
    );

    // Botón para vaciar el carrito (solo si hay items)
    if (carrito.length > 0) {
      const vaciarCarritoBtn = document.createElement('button');
      vaciarCarritoBtn.textContent = 'Vaciar carrito';
      vaciarCarritoBtn.className = 'btn-vaciar-carrito';
      vaciarCarritoBtn.style.margin = '1rem auto 2rem auto';
      vaciarCarritoBtn.style.display = 'block';
      vistaCarrito.insertBefore(vaciarCarritoBtn, itemsCarrito);

      vaciarCarritoBtn.addEventListener('click', () => {
        carrito = [];
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderVistaCarrito();
      });
    }
  }

  // Eliminar el botón de volver a la tienda (ya no es necesario)
  if (document.querySelector('.btn-cerrar-carrito')) {
    document.querySelector('.btn-cerrar-carrito').remove();
  }
  // Validación de formulario de contacto
  const form = document.querySelector("form");
  if (form) {
    form.addEventListener("submit", async function (e) {
      const nombre = this.nombre.value.trim();
      const email = this.email.value.trim();
      const mensaje = this.mensaje.value.trim();
      const errores = [];

      if (!nombre) errores.push("El nombre no puede estar vacío");
      if (!mensaje) errores.push("El mensaje no puede estar vacío");
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) errores.push("El email no es válido");

      if (errores.length > 0) {
        e.preventDefault();
        alert("Errores en el formulario:\n" + errores.join("\n"));
        return;
      }

      // Enviar el formulario vía fetch para evitar redirección
      e.preventDefault();
      const formData = new FormData(this);
      const mensajeExito = document.getElementById('mensaje-exito');
      if (mensajeExito) mensajeExito.style.display = 'none';
      try {
        const response = await fetch(this.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          this.reset();
          if (mensajeExito) {
            mensajeExito.textContent = "¡Gracias por tu mensaje! Te responderemos pronto.";
            mensajeExito.style.display = 'block';
            mensajeExito.style.color = '#388e3c';
            mensajeExito.style.background = '#e8f5e9';
            mensajeExito.style.padding = '1em';
            mensajeExito.style.marginTop = '1em';
            mensajeExito.style.borderRadius = '6px';
            setTimeout(() => { mensajeExito.style.display = 'none'; }, 6000);
          }
        } else {
          if (mensajeExito) {
            mensajeExito.textContent = "Ocurrió un error al enviar el formulario. Intenta nuevamente más tarde.";
            mensajeExito.style.display = 'block';
            mensajeExito.style.color = '#b71c1c';
            mensajeExito.style.background = '#ffebee';
            mensajeExito.style.padding = '1em';
            mensajeExito.style.marginTop = '1em';
            mensajeExito.style.borderRadius = '6px';
            setTimeout(() => { mensajeExito.style.display = 'none'; }, 6000);
          }
        }
      } catch (err) {
        if (mensajeExito) {
          mensajeExito.textContent = "Ocurrió un error de red. Intenta nuevamente más tarde.";
          mensajeExito.style.display = 'block';
          mensajeExito.style.color = '#b71c1c';
          mensajeExito.style.background = '#ffebee';
          mensajeExito.style.padding = '1em';
          mensajeExito.style.marginTop = '1em';
          mensajeExito.style.borderRadius = '6px';
          setTimeout(() => { mensajeExito.style.display = 'none'; }, 6000);
        }
      }
    });
  }
});
