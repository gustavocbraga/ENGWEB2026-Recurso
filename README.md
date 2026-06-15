# ENGWEB2026 — Exame de Época de Recurso

## Exercício 1 — O Mundo da Ópera (API de dados)

### 1.1 Setup da Base de Dados

#### Persistência de dados

O dataset unificado foi gerado pelo script `datasets/normalize_operas.py`, que combina cinco ficheiros JSON independentes (`operas.json`, `compositores.json`, `teatros.json`, `arias.json` e `cantores.json`) num único ficheiro `operas_normalized.json`.

Optou-se por **uma única coleção** (`operas`) com subdocumentos embutidos, pois todas as rotas e queries pedidas operam sobre a ópera como unidade principal. Os campos `compositor` e `teatro` são objetos embutidos; `arias` e `cantores` são arrays embutidos. As distribuições por cantor e teatro são obtidas via `$unwind` + `$group` em aggregations sobre a coleção `operas`. O campo `_id` de cada documento é o slug da ópera (ex: `"don-giovanni"`), derivado do campo `id` do dataset original.

**Parâmetros da base de dados:**
- **Database:** `operas_db`
- **Collection:** `operas`

**Modelo de cada documento:**
```json
{
  "_id": "don-giovanni",
  "title": "Don Giovanni",
  "genre": "Opera buffa",
  "premiereYear": 1787,
  "runtimeMinutes": 170,
  "descriptionEN": "...",
  "compositor": { "id": "...", "name": "Wolfgang Amadeus Mozart" },
  "teatro": { "id": "...", "name": "Estates Theatre", "country": "Czech Republic" },
  "arias": [ { "id": "...", "name": "...", "voiceType": "..." } ],
  "cantores": [ "Joan Sutherland", "Anna Netrebko", "..." ]
}
```

#### Instruções de importação

**1. Gerar o dataset unificado** (dentro da pasta `datasets`):
```bash
python3 normalize_operas.py
```

**2. Correr o container MongoDB (se ainda não estiver a correr):**
```bash
docker run -d --name mongoEW -p 27017:27017 mongo
```

**3. Copiar o dataset para o container:**
```bash
docker cp operas_normalized.json mongoEW:/tmp/operas_normalized.json
```

**4. Importar o dataset na base de dados:**
```bash
docker exec mongoEW mongoimport -d operas_db -c operas /tmp/operas_normalized.json --jsonArray
```

**5. Verificar a importação:**
```bash
docker exec -it mongoEW mongosh
use operas_db
db.operas.countDocuments()
# Esperado: 20
db.operas.findOne()
```

> Quando a aplicação corre via Docker Compose, o seed é feito automaticamente: o servidor verifica se a coleção está vazia e, se sim, insere os documentos do `operas_normalized.json` diretamente via Mongoose.

---

### 1.2 Queries MongoDB

As queries completas encontram-se também no ficheiro `ex1/queries.txt`.

#### 1. Quantas óperas estão registadas na base de dados?
```js
db.operas.countDocuments()
// Resultado: 20
```

#### 2. Quantas óperas têm uma duração (runtimeMinutes) superior a 150 minutos?
```js
db.operas.countDocuments({ runtimeMinutes: { $gt: 150 } })
// Resultado: 10
```

#### 3. Qual a lista de países onde ocorreram estreias (ordenada alfabeticamente e sem repetições)?
```js
db.operas.distinct("teatro.country").sort()
// Resultado: ["Austria", "Czech Republic", "Egypt", "France", "Germany", "Italy"]
```

#### 4. Qual a distribuição de óperas por compositor (quantas óperas cada compositor tem registadas)?
```js
db.operas.aggregate([
  { $group: { _id: "$compositor.name", total: { $sum: 1 } } },
  { $sort: { _id: 1 } },
  { $project: { _id: 0, compositor: "$_id", total: 1 } }
])
// Resultado:
// { compositor: "Gaetano Donizetti",       total: 1 }
// { compositor: "Georges Bizet",           total: 1 }
// { compositor: "Giacomo Puccini",         total: 4 }
// { compositor: "Gioachino Rossini",       total: 1 }
// { compositor: "Giuseppe Verdi",          total: 4 }
// { compositor: "Ludwig van Beethoven",    total: 1 }
// { compositor: "Richard Wagner",          total: 4 }
// { compositor: "Vincenzo Bellini",        total: 1 }
// { compositor: "Wolfgang Amadeus Mozart", total: 3 }
```

#### 5. Quais as óperas que estrearam em Itália? Devolve apenas o título e o ano de estreia.
```js
db.operas.find(
  { "teatro.country": "Italy" },
  { _id: 0, title: 1, premiereYear: 1 }
).sort({ premiereYear: 1 })
// Resultado:
// { title: "The Barber of Seville",  premiereYear: 1816 }
// { title: "Norma",                  premiereYear: 1831 }
// { title: "Lucia di Lammermoor",    premiereYear: 1835 }
// { title: "Nabucco",                premiereYear: 1842 }
// { title: "Rigoletto",              premiereYear: 1851 }
// { title: "La Traviata",            premiereYear: 1853 }
// { title: "La Boheme",              premiereYear: 1896 }
// { title: "Tosca",                  premiereYear: 1900 }
// { title: "Madama Butterfly",       premiereYear: 1904 }
// { title: "Turandot",               premiereYear: 1926 }
```

---

### 1.3 API de Dados (porta 17060)

A API foi desenvolvida em Node.js/Express com Mongoose e responde na porta `17060`. Inclui interface Swagger disponível em `/api-docs`.

#### Modelo da base de dados

A coleção `operas` da base de dados `operas_db` segue o seguinte esquema Mongoose:

| Campo            | Tipo     | Obrigatório | Descrição                                                 |
|------------------|----------|-------------|-----------------------------------------------------------|
| `_id`            | String   | sim         | Slug da ópera (ex: `"don-giovanni"`)                      |
| `title`          | String   | sim         | Título da ópera                                           |
| `genre`          | String   | sim         | Género musical (ex: `"Opera buffa"`, `"Musikdrama"`)      |
| `premiereYear`   | Number   | sim         | Ano de estreia                                            |
| `runtimeMinutes` | Number   | sim         | Duração em minutos                                        |
| `descriptionEN`  | String   | não         | Descrição em inglês                                       |
| `compositor`     | Object   | não         | Subdocumento com `id` e `name` do compositor              |
| `teatro`         | Object   | não         | Subdocumento com `id`, `name` e `country` do teatro       |
| `arias`          | [Object] | não         | Array de subdocumentos com `id`, `name` e `voiceType`     |
| `cantores`       | [String] | não         | Array com os nomes dos cantores que interpretaram a ópera |

#### Rotas disponíveis

| Método   | Rota                  | Descrição                                                                                           |
|----------|-----------------------|-----------------------------------------------------------------------------------------------------|
| `GET`    | `/operas`             | Lista todas as operas (campos: `_id`, `title`, `premiereYear`, `compositor.name`, `teatro.country`) |
| `GET`    | `/operas/:id`         | Devolve todos os campos da opera com o `id` indicado                                                |
| `GET`    | `/operas?genre=GGGG`  | Lista operas do genero `GGGG` (ex: `"Opera buffa"`): campos `_id`, `title`, `premiereYear`          |
| `GET`    | `/cantores`           | Lista de cantores ordenada alfabeticamente, sem repeticoes, com as operas em que cada um cantou     |
| `GET`    | `/teatros`            | Lista de teatros ordenada alfabeticamente, sem repeticoes, com as operas estreadas em cada um       |
| `POST`   | `/operas`             | Acrescenta uma nova opera a base de dados                                                           |
| `PUT`    | `/operas/:id`         | Atualiza os dados da opera com o `id` indicado                                                      |
| `DELETE` | `/operas/:id`         | Elimina a opera com o `id` indicado                                                                 |

#### Instruções de execução (com Docker Compose)

```bash
cd ex1
docker-compose up --build
```

- **API:** http://localhost:17060
- **Swagger UI:** http://localhost:17060/api-docs

---

## Exercício 2 — A Minha Coleção de Plantas de Interior

### 2.1 Persistência de Dados

A informação é persistida numa base de dados MongoDB com os seguintes parâmetros:

- **Database:** `plantas_db`
- **Collection:** `plantas`

O modelo de dados foi derivado a partir da análise dos pedidos HTTP feitos pelo frontend. Cada documento representa uma planta de interior com os seguintes campos:

| Campo                | Tipo      | Obrigatório | Descrição                                               |
|----------------------|-----------|-------------|---------------------------------------------------------|
| `_id`                | ObjectId  | auto        | Identificador único gerado automaticamente pelo MongoDB  |
| `nome`               | String    | sim         | Nome comum da planta                                    |
| `especie`            | String    | sim         | Nome científico da espécie                              |
| `diasRega`           | Number    | sim         | Frequência de rega em dias                              |
| `necessidadeLuz`     | String    | sim         | Um de: `"Sombra"`, `"Luz Indireta"`, `"Sol Direto"`    |
| `regadaRecentemente` | Boolean   | não         | Estado de rega recente (default: `false`)               |

O `_id` é gerado como `ObjectId` pelo MongoDB (não é um slug), pois é esse valor que o frontend usa nas operações de `PUT` e `DELETE` via Axios.

O dataset inicial encontra-se em `ex2/plantas.json` com 10 plantas de exemplo. O seed é feito automaticamente pelo serviço `importador` ao arrancar via Docker Compose.

O servidor MongoDB **não está exposto ao exterior** e é apenas acessível internamente pela rede Docker, conforme pedido no enunciado.

### 2.2 Setup da Base de Dados

O seed é automático ao correr `docker-compose up --build`. Não é necessário nenhum passo manual.

Para verificar manualmente (opcional):
```bash
docker exec -it mongodb_plantas mongosh
use plantas_db
db.plantas.countDocuments()
# Esperado: 10
db.plantas.find().pretty()
```

### 2.3 Rotas da API (porta 19040)

| Método   | Rota                    | Descrição                                                                           |
|----------|-------------------------|-------------------------------------------------------------------------------------|
| `GET`    | `/api/plantas`          | Lista todas as plantas                                                              |
| `GET`    | `/api/plantas?search=X` | Filtra plantas por nome comum ou espécie (case-insensitive)                         |
| `POST`   | `/api/plantas`          | Adiciona uma nova planta (`nome`, `especie`, `diasRega`, `necessidadeLuz`)          |
| `PUT`    | `/api/plantas/:id`      | Altera o estado booleano `regadaRecentemente` da planta com o `id` indicado         |
| `DELETE` | `/api/plantas/:id`      | Remove a planta com o `id` indicado                                                 |

### 2.4 Instruções de Execução (com Docker Compose)

```bash
cd ex2
docker-compose up --build
```

- **Interface (Nginx):** http://localhost:19041
- **API de dados:** http://localhost:19040/api/plantas