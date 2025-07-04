// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// <auto-generated/>

#nullable disable

using System;
using System.Collections.Generic;

namespace Azure.Compute.Batch
{
    /// <summary> The network configuration for the Job. </summary>
    public partial class BatchJobNetworkConfiguration
    {
        /// <summary>
        /// Keeps track of any properties unknown to the library.
        /// <para>
        /// To assign an object to the value of this property use <see cref="BinaryData.FromObjectAsJson{T}(T, System.Text.Json.JsonSerializerOptions?)"/>.
        /// </para>
        /// <para>
        /// To assign an already formatted json string to this property use <see cref="BinaryData.FromString(string)"/>.
        /// </para>
        /// <para>
        /// Examples:
        /// <list type="bullet">
        /// <item>
        /// <term>BinaryData.FromObjectAsJson("foo")</term>
        /// <description>Creates a payload of "foo".</description>
        /// </item>
        /// <item>
        /// <term>BinaryData.FromString("\"foo\"")</term>
        /// <description>Creates a payload of "foo".</description>
        /// </item>
        /// <item>
        /// <term>BinaryData.FromObjectAsJson(new { key = "value" })</term>
        /// <description>Creates a payload of { "key": "value" }.</description>
        /// </item>
        /// <item>
        /// <term>BinaryData.FromString("{\"key\": \"value\"}")</term>
        /// <description>Creates a payload of { "key": "value" }.</description>
        /// </item>
        /// </list>
        /// </para>
        /// </summary>
        private IDictionary<string, BinaryData> _serializedAdditionalRawData;

        /// <summary> Initializes a new instance of <see cref="BatchJobNetworkConfiguration"/>. </summary>
        /// <param name="subnetId"> The ARM resource identifier of the virtual network subnet which Compute Nodes running Tasks from the Job will join for the duration of the Task. The virtual network must be in the same region and subscription as the Azure Batch Account. The specified subnet should have enough free IP addresses to accommodate the number of Compute Nodes which will run Tasks from the Job. This can be up to the number of Compute Nodes in the Pool. The 'MicrosoftAzureBatch' service principal must have the 'Classic Virtual Machine Contributor' Role-Based Access Control (RBAC) role for the specified VNet so that Azure Batch service can schedule Tasks on the Nodes. This can be verified by checking if the specified VNet has any associated Network Security Groups (NSG). If communication to the Nodes in the specified subnet is denied by an NSG, then the Batch service will set the state of the Compute Nodes to unusable. This is of the form /subscriptions/{subscription}/resourceGroups/{group}/providers/{provider}/virtualNetworks/{network}/subnets/{subnet}. If the specified VNet has any associated Network Security Groups (NSG), then a few reserved system ports must be enabled for inbound communication from the Azure Batch service. For Pools created with a Virtual Machine configuration, enable ports 29876 and 29877, as well as port 22 for Linux and port 3389 for Windows. Port 443 is also required to be open for outbound connections for communications to Azure Storage. For more details see: https://learn.microsoft.com/azure/batch/batch-api-basics#virtual-network-vnet-and-firewall-configuration. </param>
        /// <exception cref="ArgumentNullException"> <paramref name="subnetId"/> is null. </exception>
        public BatchJobNetworkConfiguration(string subnetId)
        {
            Argument.AssertNotNull(subnetId, nameof(subnetId));

            SubnetId = subnetId;
        }

        /// <summary> Initializes a new instance of <see cref="BatchJobNetworkConfiguration"/>. </summary>
        /// <param name="subnetId"> The ARM resource identifier of the virtual network subnet which Compute Nodes running Tasks from the Job will join for the duration of the Task. The virtual network must be in the same region and subscription as the Azure Batch Account. The specified subnet should have enough free IP addresses to accommodate the number of Compute Nodes which will run Tasks from the Job. This can be up to the number of Compute Nodes in the Pool. The 'MicrosoftAzureBatch' service principal must have the 'Classic Virtual Machine Contributor' Role-Based Access Control (RBAC) role for the specified VNet so that Azure Batch service can schedule Tasks on the Nodes. This can be verified by checking if the specified VNet has any associated Network Security Groups (NSG). If communication to the Nodes in the specified subnet is denied by an NSG, then the Batch service will set the state of the Compute Nodes to unusable. This is of the form /subscriptions/{subscription}/resourceGroups/{group}/providers/{provider}/virtualNetworks/{network}/subnets/{subnet}. If the specified VNet has any associated Network Security Groups (NSG), then a few reserved system ports must be enabled for inbound communication from the Azure Batch service. For Pools created with a Virtual Machine configuration, enable ports 29876 and 29877, as well as port 22 for Linux and port 3389 for Windows. Port 443 is also required to be open for outbound connections for communications to Azure Storage. For more details see: https://learn.microsoft.com/azure/batch/batch-api-basics#virtual-network-vnet-and-firewall-configuration. </param>
        /// <param name="skipWithdrawFromVnet"> Whether to withdraw Compute Nodes from the virtual network to DNC when the job is terminated or deleted.  If true, nodes will remain joined to the virtual network to DNC. If false, nodes will automatically withdraw when the job ends. Defaults to false. </param>
        /// <param name="serializedAdditionalRawData"> Keeps track of any properties unknown to the library. </param>
        internal BatchJobNetworkConfiguration(string subnetId, bool? skipWithdrawFromVnet, IDictionary<string, BinaryData> serializedAdditionalRawData)
        {
            SubnetId = subnetId;
            SkipWithdrawFromVnet = skipWithdrawFromVnet;
            _serializedAdditionalRawData = serializedAdditionalRawData;
        }

        /// <summary> Initializes a new instance of <see cref="BatchJobNetworkConfiguration"/> for deserialization. </summary>
        internal BatchJobNetworkConfiguration()
        {
        }

        /// <summary> The ARM resource identifier of the virtual network subnet which Compute Nodes running Tasks from the Job will join for the duration of the Task. The virtual network must be in the same region and subscription as the Azure Batch Account. The specified subnet should have enough free IP addresses to accommodate the number of Compute Nodes which will run Tasks from the Job. This can be up to the number of Compute Nodes in the Pool. The 'MicrosoftAzureBatch' service principal must have the 'Classic Virtual Machine Contributor' Role-Based Access Control (RBAC) role for the specified VNet so that Azure Batch service can schedule Tasks on the Nodes. This can be verified by checking if the specified VNet has any associated Network Security Groups (NSG). If communication to the Nodes in the specified subnet is denied by an NSG, then the Batch service will set the state of the Compute Nodes to unusable. This is of the form /subscriptions/{subscription}/resourceGroups/{group}/providers/{provider}/virtualNetworks/{network}/subnets/{subnet}. If the specified VNet has any associated Network Security Groups (NSG), then a few reserved system ports must be enabled for inbound communication from the Azure Batch service. For Pools created with a Virtual Machine configuration, enable ports 29876 and 29877, as well as port 22 for Linux and port 3389 for Windows. Port 443 is also required to be open for outbound connections for communications to Azure Storage. For more details see: https://learn.microsoft.com/azure/batch/batch-api-basics#virtual-network-vnet-and-firewall-configuration. </summary>
        public string SubnetId { get; set; }
        /// <summary> Whether to withdraw Compute Nodes from the virtual network to DNC when the job is terminated or deleted.  If true, nodes will remain joined to the virtual network to DNC. If false, nodes will automatically withdraw when the job ends. Defaults to false. </summary>
        public bool? SkipWithdrawFromVnet { get; set; }
    }
}
