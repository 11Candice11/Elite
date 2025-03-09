import { ClientProfileService } from '/src/services/ClientProfileService.js';
import { store } from '/src/store/EliteStore.js';

export const userInfoMixin = {
    async loginUser(username, password) {
        // Trigger navigation to HomeView
        try {
            // Call login method from ClientProfileService
            const response = await this.clientProfileService.login(username, password, password);
            if (response.message === `Login successful!`) {
                this.navigateHome();
                return true;
            }
            this.errorMessage = response.message || 'Login failed. Please try again.';
            return false;
        } catch (error) {
            this.errorMessage = 'An error occurred while logging in. Please try again later.';
            console.error('Login error:', error);
            return false;
        };
    },

    async getClientInfo(idNumber, startDate, dates = []) {
        store.set('searchID', idNumber);

        const request = {
            TransactionDateStart: startDate,
            TransactionDateEnd: new Date().toISOString().split('T')[0],
            TargetCurrencyL: 170,
            ValueDates: dates,
            InputEntityModels: [
                {
                    RegistrationNumber: idNumber,
                },
            ],
        };

        try {
            // ✅ First API call to get client data
            const response = await this.clientProfileService.getClientProfile(request);
            if (!response?.entityModels[1] && !response.entityModels[0]) return;

            const clientInfo = response.entityModels[1] || response.entityModels[0]
            store.set('clientInfo', clientInfo);
            return clientInfo;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    },

    async createUser(username, email, password) {
        try {
            const response = await ClientProfileService.createUser(username, email, password);
            if (response.success) {
                this.$store.commit('setClientInfo', response.data);
                this.$router.push('/dashboard');
            } else {
                this.$store.commit('setClientInfo', null);
                this.$router.push('/');
            }
        } catch (error) {
            console.error('Failed to create user:', error);
            this.$store.commit('setClientInfo', null);
            this.$router.push('/');
        }
    },

    async getAllUsers() {
        try {
            const response = await ClientProfileService.getAllUsers();
            if (response.success) {
                this.$store.commit('setClientInfo', response.data);
                this.$router.push('/dashboard');
            } else {
                this.$store.commit('setClientInfo', null);
                this.$router.push('/');
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            this.$store.commit('setClientInfo', null);
            this.$router.push('/');
        }
    },

    getEarliestInceptionDate(detailModels) {
        if (!detailModels.length) return null;

        return detailModels
            .map(model => new Date(model.inceptionDate))
            .reduce((earliest, current) => (current < earliest ? current : earliest));
    },

    _checkExistingClient(idNumber) {
        // if (store.get('searchID') === idNumber) {
        //     return store.get('clientInfo');
        // }

        // TODO
        // Do service call to get client info
        // const returnValue = this.clientProfileService.getClientData(idNumber);
        // if (returnValue.firstNames) {
        //     const clientInfo = {
        //         firstNames: returnValue.firstNames || 'N/A',
        //         surname: returnValue.surname || 'N/A',
        //         registeredName: returnValue.registeredName || 'N/A',
        //         title: returnValue.title || 'N/A',
        //         nickname: returnValue.nickname || 'N/A',
        //         advisorName: returnValue.advisorName || 'N/A',
        //         email: returnValue.email || 'N/A',
        //         cellPhoneNumber: returnValue.cellPhoneNumber || 'N/A',
        //         detailModels: returnValue.detailModels || [],
        //         idNumber: idNumber
        //     };
        //     store.set('clientInfo', clientInfo);
        //     return clientInfo;
        // }
        return {};
    }
};