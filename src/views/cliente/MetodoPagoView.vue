<template>
<div>
    <div class="metodo-pago-view">
        <div class="container">
            <div class="card">
                <div class="left">
                    <h2>Método de pago</h2>
                    <label class="radio">
                        <input type="radio" checked>
                        Tarjeta de débito o crédito
                    </label>
                    <input v-model="cardNumber" type="text" class="field" placeholder="Introduce los 16 dígitos de la tarjeta">
                    <input v-model="cardHolderName" type="text" class="field" placeholder="Nombre en la tarjeta">
                    <div class="triple">
                        <input v-model="expiryMonth" type="text" placeholder="Mes">
                        <span class="slash">/</span>
                        <input v-model="expiryYear" type="text" placeholder="Año">
                        <input v-model="cvv" type="text" placeholder="CVV">
                    </div>
                    <input v-model="email" type="text" class="field" placeholder="Correo electrónico (opcional)">
                </div>
                <div class="right">
                    <div class="item-row">
                        <span>Paquete Semanal</span>
                        <span>$211.00 MXN</span>
                    </div>
                    <div class="item-row">
                        <span>Subtotal</span>
                        <span>$211.00 MXN</span>
                    </div>
                    <div class="item-row">
                        <span>+ IVA</span>
                        <span>$38.00 MXN</span>
                    </div>
                    <hr>
                    <div class="total-row">
                        <span>Total</span>
                        <span>$249.00 MXN</span>
                    </div>
                    <button @click="procesarPago" class="btn-pay">Pagar</button>
                    <button @click="cancelarPago" class="btn-cancel">Cancelar</button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Lógica del formulario de pago
const cardNumber = ref('')
const cardHolderName = ref('')
const expiryMonth = ref('')
const expiryYear = ref('')
const cvv = ref('')
const email = ref('')

const procesarPago = () => {
    // Validación básica
    if (!cardNumber.value || !cardHolderName.value || !expiryMonth.value || !expiryYear.value || !cvv.value) {
        alert('Por favor, completa todos los campos requeridos de la tarjeta.')
        return
    }

    console.log('Procesando pago con:', {
        cardNumber: cardNumber.value,
        cardHolderName: cardHolderName.value,
        expiryDate: `${expiryMonth.value}/${expiryYear.value}`,
        cvv: cvv.value,
        email: email.value
    })

    // En una aplicación real, aquí integrarías una pasarela de pago (Stripe, PayPal, MercadoPago, etc.)
    alert('Pago procesado con éxito! Total: $249.00 MXN')
    // router.push('/confirmacion-pago') // Redirigir a una página de confirmación
}

const cancelarPago = () => {
    alert('Pago cancelado. Serás redirigido a la página de planes.')
    router.push('/planes') 
}
</script>

<style scoped>
/* Estilos necesarios para el layout */
.metodo-pago-view {
    margin: 0;
    background: #1E1E1E; 
    font-family: Arial, sans-serif;
    color: white;
    min-height: 100vh;
}

/* Estilos de la tarjeta de pago */
.container {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    padding: 0 20px;
}

.card {
    width: 75%;
    max-width: 900px;
    background: #2C2C2C;
    padding: 40px;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    gap: 5%;
}

.left, .right {
    width: 48%;
}

h2 {
    margin-top: 0;
}

.radio {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    font-size: 14px;
    align-items: center;
}

.field {
    width: 100%;
    background: #3A3A3A;
    padding: 12px;
    border: none;
    color: white;
    margin-bottom: 15px;
    border-radius: 3px;
    box-sizing: border-box;
}

.triple {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    align-items: center;
}

.triple input {
    background: #3A3A3A;
    border: none;
    padding: 12px;
    border-radius: 3px;
    width: calc(33.33% - 7px);
    color: white;
    box-sizing: border-box;
    text-align: center;
}

.triple input:first-child,
.triple input:nth-child(3) {
    width: 70px;
}

.triple input:first-child { width: calc(33% - 10px); }
.triple input:nth-child(3) { width: calc(33% - 10px); }
.triple input:last-child { width: calc(34% - 10px); }

.slash {
    padding-top: 0;
}

.item-row, .total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

hr {
    border: none;
    border-top: 1px solid #999;
    margin: 15px 0;
}

.total-row span {
    font-size: 20px;
    font-weight: bold;
}

.btn-pay {
    width: 100%;
    background: #FFDD00;
    padding: 15px;
    border: none;
    font-size: 16px;
    margin-top: 10px;
    cursor: pointer;
    border-radius: 3px;
    font-weight: bold;
    transition: 0.2s;
}

.btn-pay:hover {
    background: #ffc600;
}

.btn-cancel {
    width: 100%;
    background: transparent;
    border: 2px solid #BFBFBF;
    padding: 15px;
    color: white;
    font-size: 16px;
    margin-top: 10px;
    cursor: pointer;
    border-radius: 3px;
    transition: 0.2s;
}

.btn-cancel:hover {
    background: rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 850px) {
    .card {
        flex-direction: column;
        width: 90%;
        padding: 20px;
    }
    .left, .right {
        width: 100%;
    }
    .left {
        margin-bottom: 30px;
    }
}
</style>