import { Request, Response, NextFunction } from "express";
import { getIpDetailsHelper } from "../../helpers/getIpDetailsHelper/getIpDetailsHelper.js";
import IpAddressDetailsData from "../../models/IpAddressDetailsData/IpAddressDetailsData.js";
import UsersPlans from "../../models/UsersPlans/UsersPlans.js";
import { validationResult } from "express-validator";
import UsersBehaviours, {
  UserBehaviourType,
} from "../../models/UsersBehaviour/UsersBehaviour.js";
import formatDateHelper from "../../helpers/getFormatDateHelper/getFormatDateHelper.js";

// Controller to get IP address details and return geolocation data
export const getIpAddressDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  try {
    const { id, username, email } = req.user;
    let ip: string = req.body?.ip;

    // Remove IPv6 prefix if present
    if (ip.startsWith("::ffff:")) {
      ip = ip.substring(7);
    }

    // Get IP details
    const locationData = await getIpDetailsHelper(ip);

    if (!locationData) {
      res.status(404).json({ error: "Location not found for the given IP." });
      return;
    }

    const latitude = locationData?.location?.latitude;
    const longitude = locationData?.location?.longitude;

    // Generate Google Maps link if latitude and longitude are available
    const googleMapsLink =
      latitude && longitude
        ? `https://www.google.com/maps?q=${latitude},${longitude}`
        : "Unknown";

    // Respond with location data
    const fetchedData = {
      ip,
      country: {
        name: locationData?.country?.names?.en || "Unknown",
        isoCode: locationData?.country?.iso_code || "Unknown",
        geonameId: locationData?.country?.geoname_id || "Unknown",
      },
      city: {
        name: locationData?.city?.names?.en || "Unknown",
        geonameId: locationData?.city?.geoname_id || "Unknown",
      },
      postal: locationData?.postal?.code || "Unknown",
      region: {
        name: locationData?.subdivisions?.[0]?.names?.en || "Unknown",
        isoCode: locationData?.subdivisions?.[0]?.iso_code || "Unknown",
        geonameId: locationData?.subdivisions?.[0]?.geoname_id || "Unknown",
      },
      latitude,
      longitude,
      timezone: locationData?.location?.time_zone || "Unknown",
      accuracyRadius: locationData?.location?.accuracy_radius || "Unknown",
      googleMapsLink,
      privacy: {
        isProxy: locationData?.traits?.is_anonymous_proxy || false,
        isTorExitNode: locationData?.traits?.is_tor_exit_node || false,
        isAnonymous: locationData?.traits?.is_anonymous || false,
        isAnonymousVpn: locationData?.traits?.is_anonymous_vpn || false,
        isHostingProvider: locationData?.traits?.is_hosting_provider || false,
      },
      network: {
        isp: locationData?.traits?.isp || "Unknown",
        organization: locationData?.traits?.organization || "Unknown",
        autonomousSystemNumber:
          locationData?.traits?.autonomous_system_number || "Unknown",
        autonomousSystemOrganization:
          locationData?.traits?.autonomous_system_organization || "Unknown",
      },
    };

    // save data
    const newfetchedData = new IpAddressDetailsData({
      user_id: id,
      username: username,
      email: email,
      searched_ip_data: fetchedData,
    });

    // save the ip details user data
    const savedfetchedData = await newfetchedData.save();

    // save behaviour
    const pendingBehaviour: UserBehaviourType = new UsersBehaviours({
      user_id: id,
      username: username,
      email: email,
      action: `fetch ip (${ip}) details`,
      action_performed_at: formatDateHelper(),
    });

    const savedBehaviour = await pendingBehaviour.save();

    // Respond with location data
    if (savedfetchedData || savedBehaviour) {
      res.status(200).json({ Success: "Location Data Retrived Successfully" });
      return;
    }
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  } finally {
    next();
  }
};

// Controller to get the user's IP address
export const getIpAddressController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let userIp: string | undefined = req.ip;

    if (userIp && userIp.startsWith("::ffff:")) {
      userIp = userIp.substring(7);
    }

    res.json({ ipv4: userIp });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  } finally {
    next();
  }
};

// Controller to deleted a IP address details
export const deleteIpAddresssDetailsDataController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ipAddressDataId = req.query.id;
    if (!ipAddressDataId) {
      res.status(401).json({ msg: "Id is required" });
    }
    const ipAddressData = await IpAddressDetailsData.findByIdAndDelete(
      ipAddressDataId
    );
    if (ipAddressData) {
      res.status(200).json({ msg: "IP Address Data Deleted Successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  } finally {
    next();
  }
};

// Controller to get the external IP address details
export const externalIpAddressController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = req.user.id;
    const resultedUser = await UsersPlans.findOne({ user_id });

    if (resultedUser) {
      const now = new Date();

      // Check if the API limit reset date has passed
      if (resultedUser.apiLimitResetDate && now >= resultedUser.apiLimitResetDate) {
        const nextReset = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        resultedUser.currently_user_api_request = 0;
        resultedUser.remaining_api_request = resultedUser.user_free_api_request_limit;
        resultedUser.apiLimitResetDate = nextReset;

        await resultedUser.save();
      }

      const apiLimit = resultedUser.user_free_api_request_limit;
      const apiUsed = resultedUser.currently_user_api_request;

      if (apiUsed < apiLimit) {
        const ip: string = req.params.ip;

        if (!ip) {
          res.status(400).json({ error: "IP address is required" });
          return;
        }

        const locationData = await getIpDetailsHelper(String(ip));
        if (!locationData) {
          res.status(404).json({ error: "IP details not found" });
          return;
        }

        const latitude = locationData?.location?.latitude;
        const longitude = locationData?.location?.longitude;

        const googleMapsLink =
          latitude && longitude
            ? `https://www.google.com/maps?q=${latitude},${longitude}`
            : "Unknown";

        const fetchedData = {
          ip,
          country: {
            name: locationData?.country?.names?.en || "Unknown",
            isoCode: locationData?.country?.iso_code || "Unknown",
            geonameId: locationData?.country?.geoname_id || "Unknown",
          },
          city: {
            name: locationData?.city?.names?.en || "Unknown",
            geonameId: locationData?.city?.geoname_id || "Unknown",
          },
          postal: locationData?.postal?.code || "Unknown",
          region: {
            name: locationData?.subdivisions?.[0]?.names?.en || "Unknown",
            isoCode: locationData?.subdivisions?.[0]?.iso_code || "Unknown",
            geonameId: locationData?.subdivisions?.[0]?.geoname_id || "Unknown",
          },
          latitude,
          longitude,
          timezone: locationData?.location?.time_zone || "Unknown",
          accuracyRadius: locationData?.location?.accuracy_radius || "Unknown",
          googleMapsLink,
          privacy: {
            isProxy: locationData?.traits?.is_anonymous_proxy || false,
            isTorExitNode: locationData?.traits?.is_tor_exit_node || false,
            isAnonymous: locationData?.traits?.is_anonymous || false,
            isAnonymousVpn: locationData?.traits?.is_anonymous_vpn || false,
            isHostingProvider:
              locationData?.traits?.is_hosting_provider || false,
          },
          network: {
            isp: locationData?.traits?.isp || "Unknown",
            organization: locationData?.traits?.organization || "Unknown",
            autonomousSystemNumber:
              locationData?.traits?.autonomous_system_number || "Unknown",
            autonomousSystemOrganization:
              locationData?.traits?.autonomous_system_organization || "Unknown",
          },
        };

        if (fetchedData) {
          res.status(200).json(fetchedData);

          resultedUser.currently_user_api_request += 1;
          resultedUser.remaining_api_request = apiLimit - resultedUser.currently_user_api_request;

          await resultedUser.save();
        } else {
          res.status(404).json({ message: "Location data not found" });
        }
      } else {
        res.status(405).json({
          msg: "Your API limit is full. Upgrade your user plan to continue.",
        });
      }
    } else {
      res.status(401).json({ msg: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json({ msg: (err as Error).message });
  } finally {
    next();
  }
};

