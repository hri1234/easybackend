// services/apiWrapperService.js
const axios = require('axios');
require('dotenv').config();
const baseUrl = process.env.baseUrl

const executeApiRequest = async (shopifyDomain, bearerToken, method, body, endpoint, id, queryParams) => {
    console.log("Request details:---------------------------------", shopifyDomain, bearerToken, method, body, endpoint, id, queryParams);
    
    let url = `${baseUrl}/subscription-contract/list?shop=${shopifyDomain}`;
    const { limit, offset, orderby , ordertype , next_billing_date} = queryParams;
    if (queryParams) {
        
        console.log("these are the urls___________-------", limit, offset, orderby , ordertype , next_billing_date);
        
        if (limit !== undefined && limit !== '') url += `&limit=${limit}`;
        if (offset !== undefined && offset !== '') url += `&offset=${offset}`;
        if (orderby) url += `&sortby=${encodeURIComponent(orderby)}`;
        if(next_billing_date !== undefined && next_billing_date !=='') url += `&next_billing_date=${next_billing_date}`;
    }
    
    console.log(queryParams,"Final URL--------------------------------:", url);
    let sortCol = orderby + " " + ordertype;
    let params = {"limit":limit,"offset":offset,"sort":[sortCol] , "next_billing_date":next_billing_date }
    try {
        const response = await axios({
            method: 'POST',
            url: url,
            data: JSON.stringify(params),
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json',
            },
        });
        
        console.log("Response Data:", JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

const pauseSubscription = async (id, shopifyDomain, bearerToken) => {
    console.log("this is more Id--------------" , id)
    try {
        const url = `${baseUrl}/subscription-contract/paused/${id}/?shop=${shopifyDomain}`;
        console.log("Bro This is A Url PAUSED--------------------------", url)
        
        const response = await axios({
            method: 'GET',
            url: url,
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json',
            },
        });
        
        
        return response.data;
    } catch (error) {
        console.error('Failed to pause subscription:', error);
        throw error;
    }
};

const ActiveSubscriptionData = async (id, shopifyDomain, bearerToken) => {
    console.log("this is more Id--------------" , id)
    try {
        const url = `${baseUrl}/subscription-contract/active/${id}/?shop=${shopifyDomain}`;
        console.log("Bro This is A Url ACTIVE--------------------------", url)
        
        const response = await axios({
            method: 'GET',
            url: url,
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json',
            },
        });
        
        
        return response.data;
    } catch (error) {
        console.error('Failed to Active subscription:', error);
        throw error;
    }
};

const SkipSubscriptionData = async (id, shopifyDomain, bearerToken) => {
    console.log("this is more Id--------------" , id)
    try {
        const url = `${baseUrl}/subscription-contract/active/${id}/?shop=${shopifyDomain}`;
        console.log("Bro This is A Url SKIP--------------------------", url)
        
        const response = await axios({
            method: 'GET',
            url: url,
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json',
            },
        });
        
        
        return response.data;
    } catch (error) {
        console.error('Failed to Skip subscription:', error);
        throw error;
    }
};

const UpdateSubscriptionFrequency = async ( shopifyDomain, bearerToken  , newContractData) => {
    // console.log("this is more Id--------------" , id)
    console.log("newContractId==============", newContractData)
    try {
        const url = `${baseUrl}/subscription-contract/frequency-update/?shop=${shopifyDomain}`;
        console.log("Bro This is A Url SKIP--------------------------", url)
        
        const response = await axios({
            method: 'PUT',
            url: url,
            data:  JSON.stringify(newContractData),
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json',
            },
        });
        console.log("this is aupdated frequency Updation--------------"  ,response.data)
        
        return response.data;
    } catch (error) {
        console.error('Failed to Update frequency subscription:', error.message);
        throw error;
    }
};

const CancelSubscriptionData = async (id, shopifyDomain, bearerToken) => {
    console.log("this is more Id--------------" , id)
    try {
        const url = `${baseUrl}/subscription-contract/cancel/${id}/?shop=${shopifyDomain}`;
        console.log("Bro This is A Url SKIP--------------------------", url)
        
        const response = await axios({
            method: 'GET',
            url: url,
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json',
            },
        });
        
        
        return response.data;
    } catch (error) {
        console.error('Failed to Cancel subscription:', error);
        throw error;
    }
};

const AllSwappingProductList = async (id, shopifyDomain, bearerToken) => {
    console.log("this is more Id--------------" , id)
    try {
        const url = `${baseUrl}/subscription-contract/swapping-products-list/?shop=${shopifyDomain}`;
        console.log("Bro This is A Url SKIP--------------------------", url)
        
        const response = await axios({
            method: 'POST',
            url: url,
            data: '{"limit":10,"offset":0,"sort":["created_at desc"]}',
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json',
            },
        });
        
        
        return response.data;
    } catch (error) {
        console.error('Failed to Get All Swapping Products:', error);
        throw error;
    }
};

const AllSubscriptionCustomerList = async (id, shopifyDomain, bearerToken) => {
    console.log("this is more Id--------------" , id)
    try {
        const url = `${baseUrl}/customer/subscriber-list/?shop=${shopifyDomain}`;
        console.log("Bro This is A Url All Customer List--------------------------", url)
        
        const response = await axios({
            method: 'POST',
            url: url,
            data: '{"limit":10,"offset":0,"query":""}',
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json',
            },
        });
        
        
        return response.data;
    } catch (error) {
        console.error('Failed to Get All Subscribe Customers:', error.data.message);
        throw error;
    }
};

const CreateSubscriptionNewGroup = async (id, shopifyDomain, bearerToken , data) => {
    console.log("this is more Id--------------" , id)
    console.log("this is a data on request body" , data)
    try {
        const url = `${baseUrl}/subscription-group/create/?shop=${shopifyDomain}`;
        console.log("Bro This is A Url All Subscription Group Create--------------------------", url)
        
        const response = await axios({
            method: 'POST',
            url: url,
            data: JSON.stringify(data), // <--- Serialize data as JSON
            headers: {'Authorization': bearerToken, 
                'Content-Type': 'application/json'}
            });
        console.log("this is data---------------" , JSON.stringify(response.data))
        return response.data;
    } catch (error) {
        console.error('Failed to Get All Subscribe Customers:', error.data.message);
        throw error;
    }
};

const AllOrderHistory = async ( shopifyDomain, bearerToken , OrderHistory) => {
    console.log("this is a data on request body--------------------------" , OrderHistory)
    try {
        const url = `${baseUrl}/subscription-contract/orders-history/?shop=${shopifyDomain}`;
        console.log("Bro This is A Url All Subscription Group Create--------------------------", url)
        
        const response = await axios({
            method: 'POST',
            url: url,
            data: JSON.stringify(OrderHistory), 
            headers: { 
                'Authorization': bearerToken, 
                'Content-Type': 'application/json'}
            });
        console.log("this is data---------------" , JSON.stringify(response.data))
        return response.data;
    } catch (error) {
        console.error('Failed to Get All Subscribe Customers:', error.message);
        throw error;
    }
};

const AllUpcomingOrder = async ( shopifyDomain, bearerToken , UpcomingOrder) => {
    console.log("this is a data on request body" , UpcomingOrder)
    try {
        const url = `${baseUrl}/subscription-contract/upcoming-orders/?shop=${shopifyDomain}`;
        console.log("Bro This is A Url All Subscription Group Create--------------------------", url)
        
        const response = await axios({
            method: 'POST',
            url: url,
            data: JSON.stringify(UpcomingOrder), 
            headers: { 
                'Authorization': bearerToken, 
                'Content-Type': 'application/json'}
            });
        console.log("this is data---------------" , JSON.stringify(response.data))
        return response.data;
    } catch (error) {
        console.error('Failed to Get All Subscribe Customers:', error.message);
        throw error;
    }
};



const GetAllKistOfGroup = async ( shopifyDomain, bearerToken , data) => {
    console.log("this is a data on request body" , data)
    
    try {
        const url = `${baseUrl}/subscription-group/list/?shop=${shopifyDomain}`;
        console.log("Bro This is A Url All Subscription Group Create--------------------------", url)
        const response = await axios({
            method: 'GET',
            url: url,
            data: JSON.stringify(data),
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json',
            },
        });
        console.log("Response Data:", JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};



const GetContractById= async ( id ,shopifyDomain, bearerToken) => {
    console.log("Request details:---------------------------------",id, shopifyDomain, bearerToken);
    const url = `${baseUrl}/subscription-contract/${id}/?shop=${shopifyDomain}`;
    console.log("this is a reallly url2222222------------------------", url)
  
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            // data: '{"limit":10,"offset":0,"sort":["created_at desc"]}',
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json',
            },
        });
        console.log("Response Data:", JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

const GetContractOrderById = async ( id ,shopifyDomain, bearerToken) => {
    console.log("Request details:---------------------------------",id, shopifyDomain, bearerToken);
    const url = `${baseUrl}/subscription-contract/order/${id}/?shop=${shopifyDomain}`;
    console.log("this is a reallly contrat order id------------------------", url)
  
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            // data: '{"limit":10,"offset":0,"sort":["created_at desc"]}',
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json',
            },
        });
        console.log("Response Data:", JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

const GetContractBillingAttemptrById = async (id, shopifyDomain, bearerToken, queryData) => {
    console.log("Request details:---------------------------------", id, shopifyDomain, bearerToken);
    const url = `${baseUrl}/subscription-contract/billing-attempt/${id}/?shop=${shopifyDomain}&success=1`;
    console.log("This is a really contract order ID------------------------", url);

    try {
        const response = await axios({
            method: 'GET',
            url: url,
            headers: {
                'Authorization': bearerToken,
                'Content-Type': 'application/json',
            },
        });
        console.log("Response Data:", JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};


module.exports = { executeApiRequest, pauseSubscription , ActiveSubscriptionData , SkipSubscriptionData , CancelSubscriptionData,AllSwappingProductList , AllSubscriptionCustomerList  , UpdateSubscriptionFrequency  ,CreateSubscriptionNewGroup , GetAllKistOfGroup , AllOrderHistory , AllUpcomingOrder , GetContractById , GetContractOrderById  , GetContractBillingAttemptrById};
