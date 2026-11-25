package registry

import (
    "fmt"
    "std"
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

func RegisterScenario(title string, targetRealm string, payload string) int {
    id := len(scenarios) + 1
    scenarios = append(scenarios, Scenario{id, std.GetOrigCaller(), title, targetRealm, payload, time.Now().Unix()})
    return id
}

func GetScenario(id int) string {
    if id < 1 || id > len(scenarios) { return "" }
    s := scenarios[id-1]
    return fmt.Sprintf("%d | %s | %s | %s | %s | %d", s.ID, s.Author, s.Title, s.TargetRealm, s.Payload, s.CreatedAt)
}

func GetScenarioCount() int { return len(scenarios) }

func Render(path string) string {
    var b strings.Builder
    b.WriteString("# GnoFlow Registry\n\nShared realm scenarios.\n\n| ID | Title | Target realm | Author |\n| --- | --- | --- | --- |\n")
    for _, s := range scenarios {
        fmt.Fprintf(&b, "| %d | %s | %s | %s |\n", s.ID, strings.ReplaceAll(s.Title, "|", "\\|"), strings.ReplaceAll(s.TargetRealm, "|", "\\|"), s.Author)
    }
    return b.String()
}
