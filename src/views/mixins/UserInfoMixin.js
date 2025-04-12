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

    async getClientInfo(idNumber, startDate = null, dates = []) {
        store.set("searchID", idNumber);

        if (!startDate) {
            startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 3);
            startDate = startDate.toISOString().split('T')[0];
            const clientInfo = store.get('clientInfo');
            if (clientInfo) return clientInfo;
        }
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
            let clientInfo = []
            // ✅ First API call to get client data
            const response = await this.clientProfileService.getClientProfile(request);
            // if (!response.entityModels[1] || !response?.entityModels[0] ) return;
            if (response.entityModels[0].detailModels.length > 0) {
                clientInfo = response.entityModels[0];
            } else if (response.entityModels[1].detailModels.length > 0) {
                clientInfo = response.entityModels[1];
            }
            store.set("clientInfo", (clientInfo));
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

    async _checkExistingClient(idNumber) {
        // if (store.get('searchID') === idNumber) {
        //     return store.get('clientInfo');
        // }

        // TODO
        // Do service call to get client info
        let clientInfo = null;
        try {
            const returnValue = await this.clientProfileService.getClient(idNumber);
            if (Array.isArray(returnValue) && returnValue.length > 0) {
                const client = returnValue[0];
                clientInfo = {
                  firstNames: client.firstNames || 'N/A',
                  surname: client.surname || 'N/A',
                  registeredName: client.registeredName || 'N/A',
                  title: client.title || 'N/A',
                  nickname: client.nickname || 'N/A',
                  advisorName: client.advisorName || 'N/A',
                  email: client.email || 'N/A',
                  cellPhoneNumber: client.cellPhoneNumber || 'N/A',
                  detailModels: client.detailModels || [],
                  idNumber: client.idNumber || idNumber
                };
            } else {
                clientInfo = await this.getClientInfo(idNumber);
            }
        } catch (error) {
            // TODO
            // Add service call to add info to DB
            clientInfo = await this.getClientInfo(idNumber);
            // this.storeToDB(clientInfo);
        } finally {
            if (clientInfo && clientInfo.firstNames) {
                this.setClientInfo(clientInfo, idNumber);
            }
            return clientInfo;
        }
    },

    async setClientInfo(clientInfo, idNumber) {
        store.set('clientInfo', clientInfo);
        this.clientInfo = clientInfo;

        const requestModel = {
            IDNumber: idNumber,
            FirstNames: clientInfo.firstNames || "N/A",
            Surname: clientInfo.surname || "N/A",
            RegisteredName: clientInfo.registeredName || "N/A",
            Title: clientInfo.title || "N/A",
            Nickname: clientInfo.nickname || "",
            AdvisorName: clientInfo.advisorName || "N/A",
            Email: clientInfo.email || "N/A",
            CellPhoneNumber: clientInfo.cellPhoneNumber || "N/A",
            ConsultantIDNumber: localStorage.getItem("username")?.replaceAll('"', '').trim() || "N/A"
        };

        const returnValue = await this.clientProfileService.addClient(requestModel);
    },

    async storeToDB(clientInfo) {
        if (!clientInfo || !clientInfo.detailModels) {
            console.error("No client information found to store.");
            return;
        }

        const formattedClientData = {
            EntityModels: [
                {
                    FirstNames: clientInfo.firstNames || "N/A",
                    Surname: clientInfo.surname || "N/A",
                    RegisteredName: clientInfo.registeredName || "N/A",
                    Title: clientInfo.title || "N/A",
                    Nickname: clientInfo.nickname || "N/A",
                    AdvisorName: clientInfo.advisorName || "N/A",
                    Email: clientInfo.email || "N/A",
                    CellPhoneNumber: clientInfo.cellPhoneNumber || "N/A",
                    DetailModels: clientInfo.detailModels.map(detail => ({
                        ReferenceNumber: detail.referenceNumber || "N/A",
                        InstrumentName: detail.instrumentName || "N/A",
                        ProductDescription: detail.productDescription || "N/A",
                        ReportingName: detail.reportingName || "N/A",
                        InceptionDate: detail.inceptionDate || new Date().toISOString(),
                        InitialContributionAmount: detail.initialContributionAmount || 0,
                        InitialContributionCurrencyAbbreviation: detail.initialContributionCurrencyAbbreviation || "N/A",
                        PortfolioEntryTreeModels: detail.portfolioEntryTreeModels.map(portfolio => ({
                            PortfolioEntryId: portfolio.portfolioEntryId || "N/A",
                            InstrumentName: portfolio.instrumentName || "N/A",
                            IsinNumber: portfolio.isinNumber || "N/A",
                            MorningStarId: portfolio.morningStarId || "N/A"
                        })),
                        TransactionModels: detail.transactionModels.map(transaction => ({
                            TransactionId: transaction.transactionId || "N/A",
                            PortfolioEntryId: transaction.portfolioEntryId || "N/A",
                            TransactionType: transaction.transactionType || "N/A",
                            TransactionDate: transaction.transactionDate || new Date().toISOString(),
                            CurrencyAbbreviation: transaction.currencyAbbreviation || "N/A",
                            ExchangeRate: transaction.exchangeRate || 0,
                            ConvertedAmount: transaction.convertedAmount || 0
                        })),
                        RootValueDateModels: detail.rootValueDateModels.map(rootValue => ({
                            RootValueId: rootValue.rootValueId || "N/A",
                            RootPortfolioEntryId: rootValue.rootPortfolioEntryId || "N/A",
                            ValueType: rootValue.valueType || "N/A",
                            ConvertedValueDate: rootValue.convertedValueDate || new Date().toISOString(),
                            CurrencyAbbreviation: rootValue.currencyAbbreviation || "N/A",
                            TotalConvertedAmount: rootValue.totalConvertedAmount || 0
                        }))
                    }))
                }
            ]
        };

        try {
            const response = await this.clientProfileService.addClient(formattedClientData);
        } catch (error) {
            console.error("❌ Failed to store client data:", error);
        }
    }
};