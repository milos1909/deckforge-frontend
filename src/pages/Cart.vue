<script lang="ts" setup>
import { useAuth } from '@/hooks/auth.hook';
import router from '@/router';
import { InvoiceService } from '@/services/invoice.service';
import { computed, ref } from 'vue';

    const { logout } = useAuth()
    const cartItems = ref<any[]>()

    InvoiceService.getCart()
        .then(rsp => cartItems.value = rsp.data)
        .catch(e => logout(e))

    const total = computed(() => {
        if (cartItems.value == undefined) return 0
        let current = 0
        for (let item of cartItems.value) {
            current += item.count * item.set.price
        }
        return current.toFixed(2)
    })

    function pay() {
        if (cartItems.value?.length == 0) {
            alert('Cart is empty!')
            return
        }

        if (!confirm('Are you sure you want to pay?'))
            return

        InvoiceService.pay()
            .then(rsp => router.push('/user'))
            .catch(e => console.log(e))
    }

    function updateCount(item: any) {
        InvoiceService.updateCartItemCount(item.id, item.count)
            .catch(e => logout(e))
    }

    function add(item: any) {
        item.count = item.count + 1
        updateCount(item)
    }

    function remove(item: any) {
        if (item.count == 1) return
        item.count = item.count - 1
        updateCount(item)
    }

    function removeItemFromCart(item: any) {
        if (!confirm(`Are you sure you want to remove the item ${item.set.setName}?`))
            return
        InvoiceService.removeCartItem(item.id)
            .then(() => {
                cartItems.value = cartItems.value!.filter(
                    i => i.id !== item.id
                )
            })
            .catch(e => logout(e))
    }
</script>

<template>
    <div class="container">
        <div class="card my-5" v-if="cartItems">
            <div class="card-header fw-bold">Items in Cart</div>
            <div class="card-body">
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Code</th>
                            <th scope="col">Number Of Cards</th>
                            <th scope="col">Price Per Item</th>
                            <th scope="col">Count</th>
                            <th scope="col">Total</th>
                            <th scope="col">Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in cartItems">
                            <th scope="row">{{ item.id }}</th>
                            <td>{{ item.set.setName }}</td>
                            <td>{{ item.set.setCode }}</td>
                            <td>{{ item.set.numOfCards }}</td>
                            <td>{{ item.set.price }} </td>
                            <td>
                                <ul class="pagination">
                                    <li class="page-item">
                                        <button type="button" class="page-link" @click="remove(item)">
                                            <i class="fa-solid fa-circle-minus"></i>
                                        </button>
                                    </li>
                                    <li class="page-item">
                                        <div class="page-link active">
                                            {{ item.count }}
                                        </div>
                                    </li>
                                    <li class="page-item">
                                        <button type="button" class="page-link" @click="add(item)">
                                            <i class="fa-solid fa-circle-plus"></i>
                                        </button>
                                    </li>
                                </ul>
                            </td>
                            <td>{{ (item.count * item.set.price).toFixed(2) }} €</td>
                            <td>
                                <div class="btn-group">
                                    <button type="button" class="btn btn-sm btn-danger" @click="removeItemFromCart(item)">
                                        <i class="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="card-footer">
                <div class="d-flex justify-content-between">
                    <div class="fw-bold">Total: <span class="h4">{{ total }} €</span></div>
                    <div>
                        <button type="button" class="btn btn-success" @click="pay" :disabled="cartItems.length == 0">
                            <i class="fa-solid fa-credit-card"></i> Pay Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <Loading v-else />
    </div>
</template>
