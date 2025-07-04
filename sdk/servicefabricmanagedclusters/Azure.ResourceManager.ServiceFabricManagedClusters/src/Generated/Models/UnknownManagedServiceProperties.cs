// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// <auto-generated/>

#nullable disable

using System;
using System.Collections.Generic;

namespace Azure.ResourceManager.ServiceFabricManagedClusters.Models
{
    /// <summary> Unknown version of ManagedServiceProperties. </summary>
    internal partial class UnknownManagedServiceProperties : ManagedServiceProperties
    {
        /// <summary> Initializes a new instance of <see cref="UnknownManagedServiceProperties"/>. </summary>
        /// <param name="placementConstraints"> The placement constraints as a string. Placement constraints are boolean expressions on node properties and allow for restricting a service to particular nodes based on the service requirements. For example, to place a service on nodes where NodeType is blue specify the following: "NodeColor == blue)". </param>
        /// <param name="correlationScheme"> A list that describes the correlation of the service with other services. </param>
        /// <param name="serviceLoadMetrics"> The service load metrics is given as an array of ServiceLoadMetric objects. </param>
        /// <param name="servicePlacementPolicies">
        /// A list that describes the correlation of the service with other services.
        /// Please note <see cref="ManagedServicePlacementPolicy"/> is the base class. According to the scenario, a derived class of the base class might need to be assigned here, or this property needs to be casted to one of the possible derived classes.
        /// The available derived classes include <see cref="ServicePlacementInvalidDomainPolicy"/>, <see cref="ServicePlacementNonPartiallyPlaceServicePolicy"/>, <see cref="ServicePlacementPreferPrimaryDomainPolicy"/>, <see cref="ServicePlacementRequiredDomainPolicy"/> and <see cref="ServicePlacementRequireDomainDistributionPolicy"/>.
        /// </param>
        /// <param name="defaultMoveCost"> Specifies the move cost for the service. </param>
        /// <param name="scalingPolicies"> Scaling policies for this service. </param>
        /// <param name="serializedAdditionalRawData"> Keeps track of any properties unknown to the library. </param>
        /// <param name="provisioningState"> The current deployment or provisioning state, which only appears in the response. </param>
        /// <param name="serviceKind"> The kind of service (Stateless or Stateful). </param>
        /// <param name="serviceTypeName"> The name of the service type. </param>
        /// <param name="partitionDescription">
        /// Describes how the service is partitioned.
        /// Please note <see cref="ManagedServicePartitionScheme"/> is the base class. According to the scenario, a derived class of the base class might need to be assigned here, or this property needs to be casted to one of the possible derived classes.
        /// The available derived classes include <see cref="NamedPartitionScheme"/>, <see cref="SingletonPartitionScheme"/> and <see cref="UniformInt64RangePartitionScheme"/>.
        /// </param>
        /// <param name="servicePackageActivationMode"> The activation Mode of the service package. </param>
        /// <param name="serviceDnsName">
        /// Dns name used for the service. If this is specified, then the DNS name can be used to return the IP addresses of service endpoints for application layer protocols (e.g., HTTP).
        /// When updating serviceDnsName, old name may be temporarily resolvable. However, rely on new name.
        /// When removing serviceDnsName, removed name may temporarily be resolvable. Do not rely on the name being unresolvable.
        /// </param>
        internal UnknownManagedServiceProperties(string placementConstraints, IList<ManagedServiceCorrelation> correlationScheme, IList<ManagedServiceLoadMetric> serviceLoadMetrics, IList<ManagedServicePlacementPolicy> servicePlacementPolicies, ServiceFabricManagedServiceMoveCost? defaultMoveCost, IList<ManagedServiceScalingPolicy> scalingPolicies, IDictionary<string, BinaryData> serializedAdditionalRawData, string provisioningState, ServiceKind serviceKind, string serviceTypeName, ManagedServicePartitionScheme partitionDescription, ManagedServicePackageActivationMode? servicePackageActivationMode, string serviceDnsName) : base(placementConstraints, correlationScheme, serviceLoadMetrics, servicePlacementPolicies, defaultMoveCost, scalingPolicies, serializedAdditionalRawData, provisioningState, serviceKind, serviceTypeName, partitionDescription, servicePackageActivationMode, serviceDnsName)
        {
            ServiceKind = serviceKind;
        }

        /// <summary> Initializes a new instance of <see cref="UnknownManagedServiceProperties"/> for deserialization. </summary>
        internal UnknownManagedServiceProperties()
        {
        }
    }
}
