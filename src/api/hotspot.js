import resource from 'resource-router-middleware';
import * as script from '../lib/system.service.js';

export default ({ config, db }) => resource({
  
  id : 'hotspot',
  
  index({ params }, res) {
    script.execPromise('hostapd load')
      .then( result => {
        let configuration = [];
        result.stdout.split('\n').forEach(function(elt) {
          if (elt.trim().length > 0) {
            let arrTmp = elt.trim().split(/[=]+/);
            configuration.push({
              field: arrTmp[0],
              value: arrTmp[1]
            });
          }
        });
        if (configuration.length === 0) {
          res.status(200).json({status: 'failed', code: -1, message: 'No configuration found' });
        } else {
          res.status(200).json({status: 'success', code: 0, message: configuration });
        }
      })
      .catch( error => {
        console.log(error);
        res.status(200).json({ status: 'failed', code : error.code, message : error.stderr });
      });
  },
  
  update({ params, body }, res) {
    if (params.hotspot === 'configuration' && typeof body.configuration !== 'undefined') {
      let fields = body.configuration;
      let fs = require('fs');
      fs.unlink('/tmp/hostapd.conf', error => {
        if (error && error.code !== 'ENOENT') {
          res.status(200).json({status: 'failed', code: error.errno, message: error });
        } else {
          let stream = fs.createWriteStream('/tmp/hostapd.conf');
          stream.once('open', () => {
            fields.forEach(elt => {
              stream.write(elt.field+'='+elt.value+'\n');
            });
            stream.end();
          });
          stream.on('error', () => {
            res.status(200).json({status: 'failed', code: -1, message: 'Unable to write the configuration file' });
          });
          stream.on('close', () => {
            script.execPromise('hostapd save')
              .then( () => {
                if (body.restart) {
                  script.execPromise('service hostapd restart')
                    .then( () => {
                      res.status(200).json({ status: 'success', code : 0, message : 'Configuration saved and service restarted' });
                    })
                    .catch(function (error) {
                      res.status(200).json({ status: 'failed', code : error.code, message : error.stderr });
                    });
                } else {
                  res.status(200).json({ status: 'success', code : 0, message : 'Configuration saved' });
                }
              })
              .catch( error => {
                console.log(error);
                res.status(200).json({status: 'failed', code: -1, message: 'Unable to write the configuration file' });
              });
          });
        }
      });
    } else {
      res.status(200).json({status: 'failed', result: {code: -1, message: 'No configuration found in the request' }});
    }
  },
  
  read({ params }, res) {
    if (params.hotspot === 'default') {
      const configuration = [{"field":"interface","value":"wlan0"},
        {"field":"driver","value":"nl80211"},
        {"field":"ssid","value":"pihotspot"},
        {"field":"hw_mode","value":"g"},
        {"field":"channel","value":"6"},
        {"field":"auth_algs","value":"1"},
        {"field":"beacon_int","value":"100"},
        {"field":"dtim_period","value":"2"},
        {"field":"max_num_sta","value":"255"},
        {"field":"rts_threshold","value":"2347"},
        {"field":"fragm_threshold","value":"2346"}];
  
      res.status(200).json({status: 'success', code: 0, message: configuration });
    }
    if (params.hotspot === 'configurationFields') {
      const hotspotConfFields = {
        interface: {
          display: 'Wifi interface',
          help: 'Interface that will be used to create the Wifi hotspot',
          type: 'select',
          data: [{text: 'wlan0', value: 'wlan0'}]
        },
        driver: {
          display: 'Chipset driver',
          help: 'Driver to activate the Wifi chipset',
          type: 'select',
          data: [{text: 'nl80211', value: 'nl80211'}]
        },
        ssid: {
          display: 'SSID',
          help: 'Name that will be visible on users\' devices. Minimal length: 3 characters. Maximum length: 255 characters.',
          type: 'text',
          data: {
            required: true,
            minLength: {value: 3},
            maxLength: {value: 255}
          }
        },
        hw_mode: {
          display: 'Wifi mode',
          help: 'Operation mode (a = IEEE 802.11a, b = IEEE 802.11b, g = IEEE 802.11g,' +
          'ad = IEEE 802.11ad (60 GHz); a/g options are used with IEEE 802.11n, too, to ' +
          'specify band). Default: IEEE 802.11b',
          type: 'select',
          data: [{text: 'a', value: 'a'}, {text: 'b', value: 'b'}, {text: 'g', value: 'g'}]
        },
        channel: {
          display: 'Channel',
          help: 'Channel number (IEEE 802.11)',
          type: 'number',
          data: {min: 1, max: 14}
        },
        auth_algs: {
          display: 'Authentication',
          help: 'IEEE 802.11 specifies two authentication algorithms. hostapd can be ' +
          'configured to allow both of these or only one. Open system authentication ' +
          'should be used with IEEE 802.1X.',
          type: 'select',
          data: [{text: 'no authentication', value: 0}, {text: 'wpa', value: 1}, {text: 'wep', value: 2}, {
            text: 'both',
            value: 3
          }]
        },
        beacon_int: {
          display: 'Beacon interval in kus',
          help: 'Beacon interval in kus (1.024 ms) (default: 100; range 15..65535)',
          type: 'number',
          data: {min: 15, max: 65535}
        },
        dtim_period: {
          display: 'Delivery Traffic Information Message',
          help: 'DTIM (delivery traffic information message) period (range 1..255): ' +
          'number of beacons between DTIMs (1 = every beacon includes DTIM element). (default: 2)',
          type: 'number',
          data: {min: 1, max: 255}
        },
        max_num_sta: {
          display: 'Maximum number of stations',
          help: 'Maximum number of stations allowed in station table. New stations will be ' +
          'rejected after the station table is full. IEEE 802.11 has a limit of 2007 ' +
          'different association IDs, so this number should not be larger than that. ' +
          '(default: 2007)',
          type: 'number',
          data: {min: 1, max: 2007}
        },
        rts_threshold: {
          display: 'RTS/CTS threshold',
          help: 'RTS/CTS threshold; 2347 = disabled (default); range 0..2347. ' +
          'If this field is not included in hostapd.conf, hostapd will not control ' +
          'RTS threshold and \'iwconfig wlan# rts <val>\' can be used to set it.',
          type: 'number',
          data: {min: 0, max: 2347}
        },
        fragm_threshold: {
          display: 'Fragmentation threshold',
          help: 'Fragmentation threshold; 2346 = disabled (default); range 256..2346. ' +
          'If this field is not included in hostapd.conf, hostapd will not control ' +
          'fragmentation threshold and \'iwconfig wlan frag <val>\' can be used to set it.',
          type: 'number',
          data: {min: 256, max: 2346}
        }
      };
  
      res.status(200).json({ status: 'success', code: 0, message: hotspotConfFields });
    }
  }
});
