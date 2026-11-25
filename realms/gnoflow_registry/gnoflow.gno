package registry

import (
    "chain/runtime/unsafe"
    "strconv"
    "strings"
    "time"
)

type Scenario struct {
    ID int
    Author address
    Title string
    TargetRealm string
    Payload string
    CreatedAt int64
}

var scenarios []Scenario

func RegisterScenario(_ realm, title string, targetRealm string, payload string) int {
    id := len(scenarios) + 1
    scenarios = append(scenarios, Scenario{id, unsafe.OriginCaller(), title, targetRealm, payload, time.Now().Unix()})
    return id
}

func GetScenario(id int) string {
    if id < 1 || id > len(scenarios) { return "" }
    s := scenarios[id-1]
    return strconv.Itoa(s.ID) + " | " + s.Author.String() + " | " + s.Title + " | " + s.TargetRealm + " | " + s.Payload + " | " + strconv.FormatInt(s.CreatedAt, 10)
}

func GetScenarioCount() int { return len(scenarios) }

func Render(path string) string {
    var b strings.Builder
    b.WriteString("# RealmFlow Registry\n\nShared realm scenarios.\n\n| ID | Title | Target realm | Author |\n| --- | --- | --- | --- |\n")
    for _, s := range scenarios {
        b.WriteString("| " + strconv.Itoa(s.ID) + " | " + strings.ReplaceAll(s.Title, "|", "\\|") + " | " + strings.ReplaceAll(s.TargetRealm, "|", "\\|") + " | " + s.Author.String() + " |\n")
    }
    return b.String()
}
