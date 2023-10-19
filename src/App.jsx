import { useState, useEffect } from 'react';
import * as clipboard from 'clipboard-polyfill';
import logo from './assets/images/logo.png';
import title from './assets/images/title.png';
import style from './App.module.css';

function App () {
  const [text, setText] = useState({
    pin: '',
    encendido: false,
    mojado: false,
    sinImagen: false,
    sinTactil: false,
    camaraTrasera: false,
    camaraDelantera: false,
    sensorProx: false,
    audifono: false,
    trueTone: false,
    wifi: false,
    puerto: false,
    microfono: false,
    altavoz: false,
    tornillos: '',
    sim: false
  });
  const [auth, setAuth] = useState('...');
  const [copy, setCopy] = useState('');

  const updateState = event => {
    const { value, checked, name, type } = event.target;

    if (type === 'number') {
      if (name === 'pin') {
        if (value < 0) {
          window.alert('No podes poner negativos en el código');
          document.getElementById('pin').value = '';
        } else {
          setText({
            ...text,
            [name]: value.substring(0, 6)
          });
        }
      }
      if (name === 'bateria') {
        if (value < 0) {
          window.alert('La batería no puede ser menor a cero');
          document.getElementById('bateria').value = '';
        }
        if (value > 100) {
          window.alert('La batería no puede ser mayor a cien porciento');
          document.getElementById('bateria').value = '';
        } else {
          document.getElementById('no_condition').checked = false;
          setText({
            ...text,
            [name]: `${value} %`
          });
        }
      }
      if (name === 'tornillos') {
        if (value < 0) {
          window.alert('No se puede poner tornillos negativos');
          document.getElementById('tornillos').value = '';
        }
        if (value > 2) {
          window.alert('Máximo de dos tornillos');
          document.getElementById('tornillos').value = '';
        } else {
          setText({
            ...text,
            [name]: value
          });
        }
      }
    } else {
      if (name === 'notTrueTone') {
        document.getElementById('true_tone').checked = false;
        if (text.hasOwnProperty('trueTone')) delete text.trueTone //eslint-disable-line
        else setText({ //eslint-disable-line
          ...text,
          trueTone: false
        });
      } else if (name === 'trueTone') {
        document.getElementById('not_true_tone').checked = false;
        setText({
          ...text,
          [name]: checked
        });
      } else if (name === 'sinImagen') {
        document.getElementById('no_touch').checked = false;
        document.getElementById('blocked').checked = false;
        setText({
          ...text,
          sinTactil: false,
          blocked: false,
          [name]: checked
        });
      } else if (name === 'sinTactil') {
        document.getElementById('no_image').checked = false;
        document.getElementById('blocked').checked = false;
        setText({
          ...text,
          sinImagen: false,
          blocked: false,
          [name]: checked
        });
      } else if (name === 'blocked') {
        document.getElementById('no_image').checked = false;
        document.getElementById('no_touch').checked = false;
        setText({
          ...text,
          sinImagen: false,
          sinTactil: false,
          [name]: checked
        });
      } else if (name === 'noCondition') {
        document.getElementById('bateria').value = '';
        setText({
          ...text,
          bateria: 'sin condición'
        });
      } else if (name === 'sinServicio') {
        if (checked) {
          document.getElementById('señal').checked = false;
          setText({
            ...text,
            señal: false
          });
        }
      } else if (name === 'señal') {
        document.getElementById('no_service').checked = false;
        setText({
          ...text,
          [name]: checked
        });
      } else if (name === 'trasVibra') {
        if (text.hasOwnProperty('trasManchas')) delete text.trasManchas //eslint-disable-line
        if (text.hasOwnProperty('trasBorrosa')) delete text.trasBorrosa //eslint-disable-line
        setText({
          ...text,
          [name]: checked
        });
      } else if (name === 'wifi') {
        if (!checked) document.getElementById('lost_wifi').checked = false;
        setText({
          ...text,
          lostWifi: false,
          [name]: checked
        });
      } else {
        setText({
          ...text,
          [name]: type === 'checkbox' ? checked : value
        });
      }
    }
  };

  const updateSelection = event => {
    const { value } = event.target;
    if (value === 'touchid') {
      document.getElementById('auth_value').checked = false;
      if (text.hasOwnProperty('faceid')) delete text.faceid //eslint-disable-line
      text.home = false;
    } else {
      document.getElementById('auth_value').checked = false;
      if (text.hasOwnProperty('touchid')) delete text.touchid //eslint-disable-line
      if (text.hasOwnProperty('home')) delete text.home //eslint-disable-line
    }

    setText({
      ...text,
      [value]: document.getElementById('auth_value').checked
    });

    setAuth(value);
  };

  const returnText = () => {
    let result = ' | Cámara trasera ';
    if (text.camaraTrasera) {
      if (text.trasVibra) {
        result += 'vibra';
      } else if (text.trasManchas) {
        result += 'con manchas';
        if (text.trasBorrosa) result += ', borrosa';
      } else if (text.trasBorrosa) {
        result += 'borrosa o no enfoca';
      } else {
        result += 'OK';
      }
    } else if (text.canNotTestRear) {
      result += 'no se puede testear';
    } else {
      result = ' | Cámara trasera no funciona';
    }

    if (text.camaraDelantera) {
      if (text.delManchas) {
        result += ' | Cámara delantera con manchas';
        if (text.delBorrosa) result += ', borrosa';
      } else if (text.delBorrosa) {
        result += ' | Cámara delantera borrosa o no enfoca';
      } else {
        result += ' | Cámara delantera OK';
      }
    } else if (text.canNotTestFront) {
      result += ' | Cámara delantera no se puede testear';
    } else {
      result += ' | Cámara delantera no funciona';
    }

    if (result === ' | Cámara trasera OK | Cámara delantera OK') result = ' | Cámaras OK';
    if (result === ' | Cámara trasera no se puede testear | Cámara delantera no se puede testear') result = ' | Cámaras no se pueden testear';

    return result;
  };

  const makeText = () => {
    if (!text.encendido) {
      setCopy(
        'Ingresa apagado, no se puede testear' +
        // `${text.pin.length >= 4 ? ` | PIN: ${text.pin}` : ''}` +
        `${text.mojado ? ' | Equipo mojado' : ''}` +
        `${text.puerto ? ' | Toma carga' : ' | No toma carga'}` +
        `${text.sucio ? ' | Puerto obstruido' : ''}` +
        `${text.tornillos > 0 ? ` | Tornillos: ${text.tornillos}` : ' | No posee tornillos'}` +
        `${text.sim ? ' | Tiene SIM' : ' | No tiene SIM'}`
      );
    } else if (text.sinImagen) {
      setCopy(
        'Ingresa encendido sin imagen, no se puede testear' +
        // `${text.pin.length >= 4 ? ` | PIN: ${text.pin}` : ''}` +
        `${text.mojado ? ' | Equipo mojado' : ''}` +
        `${text.puerto ? ' | Toma carga' : ' | No toma carga'}` +
        `${text.sucio ? ' | Puerto obstruido' : ''}` +
        `${text.tornillos > 0 ? ` | Tornillos: ${text.tornillos}` : ' | No posee tornillos'}` +
        `${text.sim ? ' | Tiene SIM' : ' | No tiene SIM'}`
      );
    } else if (text.sinTactil) {
      setCopy(
        'Ingresa encendido sin táctil, no se puede testear' +
        // `${text.pin.length >= 4 ? ` | PIN: ${text.pin}` : ''}` +
        `${text.mojado ? ' | Equipo mojado' : ''}` +
        `${text.puerto ? ' | Toma carga' : ' | No toma carga'}` +
        `${text.sucio ? ' | Puerto obstruido' : ''}` +
        `${text.tornillos > 0 ? ` | Tornillos: ${text.tornillos}` : ' | No posee tornillos'}` +
        `${text.sim ? ' | Tiene SIM' : ' | No tiene SIM'}`
      );
    } else if (text.blocked) {
      setCopy(
        'Ingresa bloqueado, no se puede testear' +
        // `${text.pin.length >= 4 ? ` | PIN: ${text.pin}` : ''}` +
        `${text.mojado ? ' | Equipo mojado' : ''}` +
        `${text.puerto ? ' | Toma carga' : ' | No toma carga'}` +
        `${text.sucio ? ' | Puerto obstruido' : ''}` +
        `${text.tornillos > 0 ? ` | Tornillos: ${text.tornillos}` : ' | No posee tornillos'}` +
        `${text.sim ? ' | Tiene SIM' : ' | No tiene SIM'}`
      );
    } else {
      setCopy(
        // `${text.pin.length >= 4 ? ` | PIN: ${text.pin}` : ''}` +
        `${text.mojado ? 'Equipo mojado | ' : ''}` +
        `${text.hasOwnProperty('faceid') ? `FaceID ${text.faceid ? 'OK' : 'NO funciona'}` : ''}` + //eslint-disable-line
        `${text.hasOwnProperty('touchid') ? ` | TouchID ${text.touchid ? 'OK ' : 'NO funciona'}` : ''}` + //eslint-disable-line
        `${text.hasOwnProperty('home') ? ` | Home ${text.home ? 'OK ' : 'NO funciona'}` : ''}` + //eslint-disable-line
        `${text.hasOwnProperty('trueTone') ? text.trueTone ? ' | TrueTone OK' : ' | SIN TrueTone' : ''}` + //eslint-disable-line
        `${text.bateria ? ` | Batería ${text.bateria}` : ''}` +
        returnText() +
        `${text.sensorProx ? ' | Sensor OK' : ' | Sensor NO funciona'}` +
        `${text.audifono ? ' | Audífono OK' : ' | Audífono NO funciona'}` +
        `${text.hasOwnProperty('señal') ? text.señal ? ' | Señal OK' : ' | Sin servicio' : ''}` + //eslint-disable-line
        `${text.wifi ? ' | WIFI OK' : ' | WIFI NO funciona'}` +
        `${text.lostWifi ? ' con poco alcance' : ''}` +
        `${text.puerto ? ' | Toma carga' : ' | No toma carga'}` +
        `${text.sucio ? ' | Puerto obstruido' : ''}` +
        `${text.microfono ? ' | Micrófonos OK' : ' | Micrófonos NO funcionan'}` +
        `${text.altavoz ? ' | Altavoz OK' : ' | Altavoz NO funciona'}` +
        `${text.tornillos > 0 ? ` | Tornillos: ${text.tornillos}` : ' | No posee tornillos'}` +
        `${text.sim ? ' | Tiene SIM' : ' | No tiene SIM'}`
      );
    }

    console.log(text);
  };

  useEffect(() => {
    copy.length !== 0 && clipboard.writeText(copy);
  }, [text, copy]);

  return (
    <div className={style.app__container}>
      <div className={style.app__content}>
        <div className={style.logo_and_title__container}>
          <img src={logo} alt='logo' width={70}/>
          <img src={title} alt='logo' width={120}/>
        </div>
        <form className={style.form__container}>
          {/* <span>
            <label>PIN:</label>
            <input id='pin' name='pin' type='number' onChange={updateState} value={text.pin}/>
          </span>
          <hr /> */}
          <span>
            <label>Encendido:</label>
            <input id='turn_on' name='encendido' type='checkbox' onChange={updateState} value={text.encendido}/>
            <label>| Mojado:</label>
            <input id='mojado' name='mojado' type='checkbox' onChange={updateState} value={text.mojado}/>
          </span>
          <hr />
          {
            text.encendido
              ? <>
                  <span>
                    <label>Sin Imagen:</label>
                    <input id='no_image' name='sinImagen' type='checkbox' onChange={updateState} value={text.sinImagen}/>
                    <label>| Sin Táctil:</label>
                    <input id='no_touch' name='sinTactil' type='checkbox' onChange={updateState} value={text.sinTactil}/>
                    <label>| Bloqueado:</label>
                    <input id='blocked' name='blocked' type='checkbox' onChange={updateState} value={text.blocked}/>
                  </span>
                  <hr />
                  {
                    !text.sinImagen && !text.sinTactil && !text.blocked
                      ? <>
                          <span>
                            <select id='auth_select' onChange={updateSelection}>
                              <option value='Select' name='select'>...</option>
                              <option value='faceid' name='faceid'>FaceID</option>
                              <option value='touchid' name='touchid'>TouchID</option>
                            </select>
                            <input id='auth_value' name={auth} type='checkbox' onChange={updateState}/>
                            {
                              text.hasOwnProperty('touchid') //eslint-disable-line
                                ? <>
                                    <label>| Home:</label>
                                    <input id='home' name='home' type='checkbox' onChange={updateState}/>
                                  </>
                                : ''
                            }
                            <label>| TrueTone:</label>
                            <input id='true_tone' name='trueTone' type='checkbox' onChange={updateState}/>
                            <label>No posee:</label>
                            <input id='not_true_tone' name='notTrueTone' type='checkbox' onChange={updateState}/>
                          </span>
                          <hr />
                          <span>
                            <label>Batería:</label>
                            <input id='bateria' name='bateria' type='number' onChange={updateState}/>
                            <label style={{ marginRight: '5px' }}>%</label>
                            <label> | Sin condición:</label>
                            <input id='no_condition' name='noCondition' type='checkbox' onChange={updateState}/>
                          </span>
                          <hr />
                          <span className={style.antenna__container}>
                            <span>
                              <label>Wi-Fi:</label>
                              <input id='wifi' name='wifi' type='checkbox' onChange={updateState} value={text.wifi}/>
                              {
                                text.wifi
                                  ? <>
                                      <label>| Poco alcance:</label>
                                      <input id='lost_wifi' name='lostWifi' type='checkbox' onChange={updateState}/>
                                    </>
                                  : ''
                              }
                            </span>
                            <hr />
                            <span>
                              <label>Señal:</label>
                              <input id='señal' name='señal' type='checkbox' onChange={updateState} value={text.señal}/>
                              <label>| Sin servicio:</label>
                              <input id='no_service' name='sinServicio' type='checkbox' onChange={updateState}/>
                            </span>
                          </span>
                          <hr />
                          <span>
                            <label>Sensor Prox:</label>
                            <input id='sensor_prox' name='sensorProx' type='checkbox' onChange={updateState} value={text.sensorProx}/>
                            <label>| Audífono:</label>
                            <input id='audifono' name='audifono' type='checkbox' onChange={updateState} value={text.audifono}/>
                            <label>| Altavoz:</label>
                            <input id='altavoz' name='altavoz' type='checkbox' onChange={updateState} value={text.altavoz}/>
                          </span>
                          <hr />
                          <span className={style.cameras__container}>
                            <legend>Cámaras ⤵️</legend>
                            <span>
                              <label>Trasera:</label>
                              <input id='cam_trasera' name='camaraTrasera' type='checkbox' onChange={updateState} value={text.camaraTrasera}/>
                              {
                                text.camaraTrasera
                                  ? <>
                                      <label>| Vibra:</label>
                                      <input id='cam_vibra' name='trasVibra' type='checkbox' onChange={updateState}/>
                                      {
                                        !text.trasVibra
                                          ? <>
                                              <label>| Manchas:</label>
                                              <input id='mancha_trasera' name='trasManchas' type='checkbox' onChange={updateState}/>
                                              <label>| Borrosa/No enfoca:</label>
                                              <input id='tras_borrosa' name='trasBorrosa' type='checkbox' onChange={updateState}/>
                                            </>
                                          : ''
                                      }
                                    </>
                                  : ''
                              }
                              {
                                !text.camaraTrasera
                                  ? <>
                                      <label>No se puede testear:</label>
                                      <input id='can_not_test_rear' name='canNotTestRear' type='checkbox' onChange={updateState}/>
                                    </>
                                  : ''
                              }
                            </span>
                            <hr />
                            <span>
                              <label>Delantera:</label>
                              <input id='cam_delantera' name='camaraDelantera' type='checkbox' onChange={updateState} value={text.camaraDelantera}/>
                              {
                                text.camaraDelantera
                                  ? <>
                                      <label>| Manchas:</label>
                                      <input id='mancha_delantera' name='delManchas' type='checkbox' onChange={updateState}/>
                                      <label>| Borrosa/No enfoca:</label>
                                      <input id='del_borrosa' name='delBorrosa' type='checkbox' onChange={updateState}/>
                                    </>
                                  : ''
                              }
                              {
                                !text.camaraDelantera
                                  ? <>
                                      <label>No se puede testear:</label>
                                      <input id='can_not_test_front' name='canNotTestFront' type='checkbox' onChange={updateState}/>
                                    </>
                                  : ''
                              }
                            </span>
                          </span>
                          <hr />
                        </>
                      : ''
                  }
                </>
              : ''
          }
          <span>
            <label>Puerto:</label>
            <input id='puerto' name='puerto' type='checkbox' onChange={updateState} value={text.puerto}/>
            <label>| Sucio:</label>
            <input id='sucio' name='sucio' type='checkbox' onChange={updateState}/>
            {
              text.encendido && !text.sinImagen && !text.sinTactil && !text.blocked
                ? <>
                    <label>| Micrófono:</label>
                    <input id='microfono' name='microfono' type='checkbox' onChange={updateState} value={text.microfono}/>
                  </>
                : ''
            }
          </span>
          <hr />
          <span>
            <label>Tornillos:</label>
            <input id='tornillos' name='tornillos' type='number' onChange={updateState}/>
            <label>| Posee SIM:</label>
            <input id='sim' name='sim' type='checkbox' onChange={updateState}/>
          </span>
        </form>
        <div className={style.buttons_container}>
          <button className={style.generate} onClick={makeText}>¡Listo!</button>
          <button className={style.generate} onClick={() => window.location.reload()}>Limpiar</button>
        </div>
        <span className={style.copyText}>{copy}</span>
      </div>
    </div>
  );
}

export default App;
