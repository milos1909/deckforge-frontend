<script lang="ts" setup>
    import { DataService } from '@/services/data.service';
    import { ref } from 'vue';
    import type { UserModel } from '@/models/user.model';
    import type { InvoiceModel } from '@/models/invoice.model';

    const user = ref<UserModel>()
    DataService.useAxios('/user/profile')
        .then(rsp => user.value = rsp.data)

    function getTotal(invoice: InvoiceModel) {
        let total = 0
        for (let item of invoice.invoiceItems) {
            total += item.pricePerItem * item.count
        }
        return total
    }
</script>

<template>
    <div class="container">
        <div class="row my-5" v-if="user">
            <div class="col-12 col-md-6">
                <div class="card">
                    <div class="card-header fw-bold">User Details</div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="first" class="form-label">Username:</label>
                            <input type="text" class="form-control" id="first" v-model="user.username" disabled>
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email:</label>
                            <input type="email" class="form-control" id="email" v-model="user.email" disabled>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button type="button" class="btn btn-success">
                            <i class="fa-solid fa-floppy-disk"></i> Save
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-6">
                <div class="card">
                    <div class="card-header fw-bold">Invoices</div>
                    <div class="card-body">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Total</th>
                                    <th scope="col">Paid At</th>
                                    <th scope="col">Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="invoice in user.invoices">
                                    <th scope="row">{{ invoice.id }}</th>
                                    <td>{{ getTotal(invoice) }} €</td>
                                    <td>{{ new Date(invoice.pursTime).toLocaleString() }}</td>
                                    <td>
                                        <div class="btn-group">
                                            <RouterLink :to="`/invoice/${invoice.id}`" class="btn btn-sm btn-info">
                                                <i class="fa-solid fa-file-invoice"></i>
                                            </RouterLink>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>